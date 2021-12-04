import { assets } from "brigsby/dist/Assets"
import { Component } from "brigsby/dist/Component"
import { Entity } from "brigsby/dist/Entity"
import { Point } from "brigsby/dist/Point"
import { SpriteComponent } from "brigsby/dist/sprites/SpriteComponent"
import { SpriteTransform } from "brigsby/dist/sprites/SpriteTransform"
import { Lists } from "brigsby/dist/util/Lists"
import { Sounds } from "../../audio/Sounds"
import { Player } from "../../characters/Player"
import { WeaponType } from "../../characters/weapons/WeaponType"
import { Tilesets, TILE_SIZE } from "../../graphics/Tilesets"
import { Item } from "../../items/Items"
import { Ground } from "../ground/Ground"
import { camp } from "../LocationManager"
import { TimeUnit } from "../TimeUnit"
import { WorldLocation } from "../WorldLocation"
import { WorldTime } from "../WorldTime"
import { ElementComponent } from "./ElementComponent"
import { ElementFactory } from "./ElementFactory"
import { ElementType } from "./Elements"
import { HittableResource } from "./HittableResource"

const NEXT_GROWTH_TIME = "ngt"
const SIZE = "s" // one of [1, 2, 3]
const AVAILABLE_RESOURCES = "a"
const CHOPPING_AUDIO = Lists.range(0, 5).map((n) => `audio/impact/impactPlank_medium_00${n}.ogg`)
const CHOPPING_AUDIO_VOLUME = 0.3

export class TreeFactory extends ElementFactory {
    readonly type: ElementType.TREE_ROUND | ElementType.TREE_POINTY
    readonly dimensions = new Point(1, 2)

    constructor(type: ElementType.TREE_ROUND | ElementType.TREE_POINTY) {
        super()
        this.type = type
        assets.loadAudioFiles(CHOPPING_AUDIO)
    }

    make(wl: WorldLocation, pos: Point, data: object): ElementComponent {
        const maxResourcesCount = 4

        const nextGrowthTime = data[NEXT_GROWTH_TIME] ?? this.nextGrowthTime()
        const size = data[SIZE] ?? 1
        const availableResources = data[AVAILABLE_RESOURCES] ?? maxResourcesCount

        const e = new Entity()
        const randomOffset = new Point(0, -4).randomlyShifted(2, 4)
        const depth = (pos.y + 2) * TILE_SIZE + randomOffset.y

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
        let tiles: SpriteComponent[]
        if (size === 3) {
            tiles = [
                addTile(`${prefix}Top`, pos),
                addTile(`${prefix}Base`, pos.plus(new Point(0, 1))),
            ]
        } else {
            tiles = [
                addTile(`${prefix}${["Sapling", "Small"][size - 1]}`, pos.plus(new Point(0, 1))),
            ]
        }

        const mirrored = Math.random() > 0.5
        tiles.forEach((t) => (t.transform.mirrorX = mirrored))

        // const hitboxDims = new Point(8, 3)
        // e.addComponent(new BoxCollider(
        //     pos.plus(new Point(.5, 2)).times(TILE_SIZE).minus(new Point(hitboxDims.x/2, hitboxDims.y)).plus(randomOffset),
        //     hitboxDims
        // ))

        const saplingType =
            this.type === ElementType.TREE_ROUND ? Item.ROUND_SAPLING : Item.POINTY_SAPLING

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
                () => Sounds.play(Lists.oneOf(CHOPPING_AUDIO), CHOPPING_AUDIO_VOLUME)
            )
        )

        if (size < 3) {
            e.addComponent(
                new GrowableTree(nextGrowthTime, () => {
                    e.selfDestruct()
                    wl.addElement(this.type, pos, {
                        [NEXT_GROWTH_TIME]: this.nextGrowthTime(),
                        [SIZE]: Math.min(size + 1, 3),
                        [AVAILABLE_RESOURCES]: hittableResource.freeResources,
                    })
                })
            )
        }

        return e.addComponent(
            new ElementComponent(this.type, pos, [], () => {
                return {
                    [NEXT_GROWTH_TIME]: nextGrowthTime,
                    [SIZE]: size,
                    [AVAILABLE_RESOURCES]: hittableResource.freeResources,
                }
            })
        )
    }

    canPlaceInLocation(wl: WorldLocation) {
        return wl === camp()
    }

    canPlaceAtPos(wl: WorldLocation, pos: Point) {
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
