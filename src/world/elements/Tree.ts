import { Component, Entity, Point } from "brigsby/dist"
import { SpriteComponent, SpriteTransform } from "brigsby/dist/sprites"
import { Lists } from "brigsby/dist/util"
import { loadAudio } from "../../audio/DeferLoadAudio"
import { Sounds } from "../../audio/Sounds"
import { WeaponType } from "../../characters/weapons/WeaponType"
import { TILE_SIZE, Tilesets } from "../../graphics/Tilesets"
import { Particles } from "../../graphics/particles/Particles"
import { Item } from "../../items/Item"
import { Color } from "../../ui/Color"
import { TimeUnit } from "../TimeUnit"
import { WorldTime } from "../WorldTime"
import { Ground } from "../ground/Ground"
import { Location } from "../locations/Location"
import { Burnable } from "./Burnable"
import { ElementComponent } from "./ElementComponent"
import { ElementFactory } from "./ElementFactory"
import { ElementType } from "./ElementType"
import { Growable } from "./Growable"
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

export const playChoppingSound = (centerPos: Point) =>
    Sounds.playAtPoint(Lists.oneOf(CHOPPING_AUDIO), CHOPPING_AUDIO_VOLUME, centerPos)

type TreeType = ElementType.TREE_ROUND | ElementType.TREE_POINTY

const CHOPPING_AUDIO = loadAudio(
    Lists.range(0, 5).map((n) => `audio/impact/impactPlank_medium_00${n}.ogg`)
)
const CHOPPING_AUDIO_VOLUME = 0.3
const PUSH_AUDIO = loadAudio([
    ...Lists.range(1, 10).map((i) => `audio/nature/Footstep/FootstepGrass0${i}.wav`),
    ...Lists.range(1, 6).map((i) => `audio/nature/Foliage/Foliage0${i}.wav`),
])

export class TreeFactory extends ElementFactory<TreeType, SaveData> {
    readonly dimensions = new Point(1, 1)

    make(wl: Location, pos: Point, data: SaveData): ElementComponent<TreeType, SaveData> {
        const maxResourcesCount = 4

        const size = data.s ?? 1
        const nextGrowthTime = size < 3 ? data.ngt ?? this.nextGrowthTime() : undefined
        const availableResources = data.a ?? maxResourcesCount

        const e = new Entity()
        const randomOffset = new Point(0, -4).randomlyShifted(2, 4)
        const depth = (pos.y + 1) * TILE_SIZE + randomOffset.y

        const burnable = e.addComponent(
            new Burnable(!!data.b, size === 3 ? [pos, pos.plusY(-1)] : [pos], randomOffset)
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
                addTile(`${prefix}Top${topVariant}`, pos.plusY(-1)),
                addTile(`${prefix}Base${bottomVariant}`, pos),
            ]
        } else if (size == 2) {
            tiles = [addTile(`${prefix}Small${topVariant}`, pos)]
        } else {
            tiles = [addTile(`${prefix}Sapling`, pos)]
        }

        tiles.forEach((t) => (t.transform.mirrorX = Math.random() > 0.5))

        const saplingType =
            this.type === ElementType.TREE_ROUND ? Item.ROUND_SAPLING : Item.POINTY_SAPLING

        const particleColors =
            this.type === ElementType.TREE_ROUND
                ? [Color.BROWN_4, Color.GREEN_6, Color.GREEN_6]
                : [Color.TAUPE_3, Color.GREEN_4, Color.GREEN_4]

        const emitParticles = (count) => {
            const position = pos.plus(new Point(0.5, 0)).times(TILE_SIZE).plus(randomOffset)
            for (let i = 0; i < count; i++) {
                const speed = Math.random() > 0.5 ? 0.01 : 0.03
                Particles.instance.emitParticle(
                    Lists.oneOf(particleColors),
                    position.randomCircularShift(10),
                    depth,
                    250 + Math.random() * 250,
                    (t) => new Point(0, t * speed),
                    Math.random() > 0.5 ? new Point(2, 2) : new Point(1, 1)
                )
            }
        }

        const hittableCenter = pos
            .times(TILE_SIZE)
            .plus(new Point(TILE_SIZE / 2, TILE_SIZE / 2))
            .plus(randomOffset) // center of bottom tile
        const hittableResource = e.addComponent(
            new HittableResource(
                hittableCenter,
                tiles.map((t) => t.transform),
                availableResources,
                maxResourcesCount,
                (dude) => {
                    if (size === 1 || (size === 2 && Math.random() > 0.5)) {
                        return []
                    }
                    const getItem = () => (Math.random() < 0.2 ? saplingType : Item.WOOD)
                    if (dude.weaponType === WeaponType.AXE) {
                        return [getItem(), getItem()]
                    } else {
                        return [getItem()]
                    }
                },
                () => {
                    playChoppingSound(hittableCenter)
                    emitParticles(5)
                },
                () => emitParticles(40)
            )
        )

        if (size < 3) {
            e.addComponent(
                new Growable(nextGrowthTime, () => {
                    e.selfDestruct()
                    const treeData: SaveData = {
                        ngt: this.nextGrowthTime(),
                        s: Math.min(size + 1, 3) as 1 | 2 | 3,
                        a: hittableResource.availableResources,
                    }
                    wl.addElement(this.type, pos, treeData)
                })
            )
        }

        e.addComponent(
            new Pushable(
                pos.plusX(0.5).plusY(1).times(TILE_SIZE),
                tiles.map((t) => t.transform),
                () => !hittableResource.isBeingHit(),
                (dude) => {
                    Sounds.playAtPoint(Lists.oneOf(PUSH_AUDIO), 0.2, dude.standingPosition)
                    emitParticles(Math.random() * 10 - 5)
                }
            )
        )

        e.addComponent(new Tree(size === 3, pos))

        return e.addComponent(
            new ElementComponent(this.type, pos, () => {
                return {
                    ngt: nextGrowthTime,
                    s: size,
                    a: hittableResource.availableResources,
                    b: burnable.isBurning ? true : undefined,
                }
            })
        )
    }

    canPlaceInLocation(wl: Location) {
        return !wl.isInterior
    }

    canPlaceAtPos(wl: Location, pos: Point) {
        const ground = wl.getGround(pos)
        return Ground.isNaturalGround(ground?.type)
    }

    private nextGrowthTime() {
        // grow every 24-48 hours
        return Math.floor(WorldTime.instance.time + TimeUnit.DAY * (1 + Math.random()))
    }
}

export class Tree extends Component {
    constructor(readonly choppable: boolean, readonly rootTile: Point) {
        super()
    }
}
