import { Component, Entity, Point } from "brigsby/dist"
import { SpriteComponent, SpriteTransform } from "brigsby/dist/sprites"
import { Lists } from "brigsby/dist/util"
import { loadAudio } from "../../audio/DeferLoadAudio"
import { Sounds } from "../../audio/Sounds"
import { Player } from "../../characters/Player"
import { WeaponType } from "../../characters/weapons/WeaponType"
import { Particles } from "../../graphics/particles/Particles"
import { Tilesets, TILE_SIZE } from "../../graphics/Tilesets"
import { Item } from "../../items/Items"
import { Color } from "../../ui/Color"
import { Ground } from "../ground/Ground"
import { Location } from "../locations/Location"
import { camp } from "../locations/LocationManager"
import { TimeUnit } from "../TimeUnit"
import { WorldTime } from "../WorldTime"
import { Burnable } from "./Burnable"
import { ElementComponent } from "./ElementComponent"
import { ElementFactory } from "./ElementFactory"
import { ElementType } from "./Elements"
import { HittableResource } from "./HittableResource"
import { Pushable } from "./Pushable"

type SaveData = {
    // next growth time
    ngt?: number
    // size
    s?: 1 | 2 | 3
    // available resources
    a?: number
    // burning
    b?: boolean
}

const CHOPPING_AUDIO = Lists.range(0, 5).map((n) => `audio/impact/impactPlank_medium_00${n}.ogg`)
const CHOPPING_AUDIO_VOLUME = 0.3
const PUSH_AUDIO = [
    ...Lists.range(1, 10).map((i) => `audio/nature/Footstep/FootstepGrass0${i}.wav`),
    ...Lists.range(1, 6).map((i) => `audio/nature/Foliage/Foliage0${i}.wav`),
]

export class TreeFactory extends ElementFactory<SaveData> {
    readonly type: ElementType.TREE_ROUND | ElementType.TREE_POINTY
    readonly dimensions = new Point(1, 2)

    constructor(type: ElementType.TREE_ROUND | ElementType.TREE_POINTY) {
        super()
        this.type = type
        loadAudio([...CHOPPING_AUDIO, ...PUSH_AUDIO])
    }

    make(wl: Location, pos: Point, data: SaveData): ElementComponent<SaveData> {
        const maxResourcesCount = 4

        const nextGrowthTime = data.ngt ?? this.nextGrowthTime()
        const size = data.s ?? 1
        const availableResources = data.a ?? maxResourcesCount

        const e = new Entity()
        const randomOffset = new Point(0, -4).randomlyShifted(2, 4)
        const depth = (pos.y + 2) * TILE_SIZE + randomOffset.y

        const burnable = e.addComponent(
            new Burnable(!!data.b, size === 3 ? [pos, pos.plusY(1)] : [pos.plusY(1)])
        )

        const addTile = (s: string, pos: Point) => {
            const tile = e.addComponent(
                new SpriteComponent(
                    Tilesets.instance.outdoorTiles.getTileSource(s),
                    new SpriteTransform(pos.times(TILE_SIZE).plus(randomOffset))
                )
            )
            tile.transform.depth = depth
            return tile
        }

        const prefix = this.type === ElementType.TREE_ROUND ? "treeRound" : "treePointy"
        const topVariant = Math.floor(Math.random() * 3)
        const bottomVariant = Math.floor(Math.random() * 3)
        let tiles: SpriteComponent[]
        if (size === 3) {
            tiles = [
                addTile(`${prefix}Top${topVariant}`, pos),
                addTile(`${prefix}Base${bottomVariant}`, pos.plusY(1)),
            ]
        } else if (size == 2) {
            tiles = [addTile(`${prefix}Small${topVariant}`, pos.plusY(1))]
        } else {
            tiles = [addTile(`${prefix}Sapling`, pos.plusY(1))]
        }

        tiles.forEach((t) => (t.transform.mirrorX = Math.random() > 0.5))

        const saplingType =
            this.type === ElementType.TREE_ROUND ? Item.ROUND_SAPLING : Item.POINTY_SAPLING

        const particleColors =
            this.type === ElementType.TREE_ROUND
                ? [Color.BROWN_4, Color.GREEN_6, Color.GREEN_6]
                : [Color.TAUPE_3, Color.GREEN_4, Color.GREEN_4]

        const emitParticles = () => {
            const position = pos.plus(new Point(0.5, 1)).times(TILE_SIZE).plus(randomOffset)
            for (let i = 0; i < 40; i++) {
                const speed = Math.random() > 0.5 ? 0.01 : 0.03
                Particles.instance.emitParticle(
                    Lists.oneOf(particleColors),
                    position.randomCircularShift(10),
                    (pos.y + 2) * TILE_SIZE,
                    250 + Math.random() * 250,
                    (t) => new Point(0, t * speed),
                    Math.random() > 0.5 ? new Point(2, 2) : new Point(1, 1)
                )
            }
        }

        const hittableCenter = pos
            .times(TILE_SIZE)
            .plus(new Point(TILE_SIZE / 2, TILE_SIZE + TILE_SIZE / 2))
            .plus(randomOffset) // center of bottom tile
        const hittableResource = e.addComponent(
            new HittableResource(
                hittableCenter,
                tiles.map((t) => t.transform),
                availableResources,
                maxResourcesCount,
                () => {
                    if (size === 1 || (size === 2 && Math.random() > 0.5)) {
                        return []
                    }
                    const getItem = () => (Math.random() < 0.2 ? saplingType : Item.WOOD)
                    if (Player.instance.dude.weaponType === WeaponType.AXE) {
                        return [getItem(), getItem()]
                    } else {
                        return [getItem()]
                    }
                },
                () => Sounds.play(Lists.oneOf(CHOPPING_AUDIO), CHOPPING_AUDIO_VOLUME),
                () => emitParticles()
            )
        )

        if (size < 3) {
            e.addComponent(
                new GrowableTree(nextGrowthTime, () => {
                    e.selfDestruct()
                    const treeData: SaveData = {
                        ngt: this.nextGrowthTime(),
                        s: Math.min(size + 1, 3) as 1 | 2 | 3,
                        a: hittableResource.freeResources,
                    }
                    wl.addElement(this.type, pos, treeData)
                })
            )
        }

        e.addComponent(
            new Pushable(
                pos.plusX(0.5).plusY(2).times(TILE_SIZE),
                tiles.map((t) => t.transform),
                () => !hittableResource.isBeingHit(),
                (dude) =>
                    Sounds.playAtPoint(
                        Lists.oneOf(PUSH_AUDIO),
                        0.2,
                        dude.standingPosition,
                        TILE_SIZE * 10
                    )
            )
        )

        return e.addComponent(
            new ElementComponent(this.type, pos, () => {
                return {
                    ngt: nextGrowthTime,
                    s: size,
                    a: hittableResource.freeResources,
                    b: burnable.isBurning ? true : undefined,
                }
            })
        )
    }

    canPlaceInLocation(wl: Location) {
        return wl === camp()
    }

    canPlaceAtPos(wl: Location, pos: Point) {
        const ground = wl.getGround(pos.plusY(1))
        return Ground.isNaturalGround(ground?.type)
    }

    private nextGrowthTime() {
        // grow every 24-48 hours
        return WorldTime.instance.time + TimeUnit.DAY * (1 + Math.random())
    }
}

class GrowableTree extends Component {
    private nextGrowthTime: number
    private growFn: () => void

    constructor(nextGrowthTime: number, growFn: () => void) {
        super()
        this.nextGrowthTime = nextGrowthTime
        this.growFn = growFn
    }

    lateUpdate() {
        if (WorldTime.instance.time < this.nextGrowthTime) {
            return
        }

        this.growFn()
    }
}
