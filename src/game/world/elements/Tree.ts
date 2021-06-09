import { Point } from "../../../engine/Point"
import { TILE_SIZE, Tilesets } from "../../graphics/Tilesets"
import { BoxCollider } from "../../../engine/collision/BoxCollider"
import { WorldLocation } from "../WorldLocation"
import { TileComponent } from "../../../engine/tiles/TileComponent"
import { TileTransform } from "../../../engine/tiles/TileTransform"
import { Entity } from "../../../engine/Entity"
import { Item } from "../../items/Items"
import { HittableResource } from "./HittableResource"
import { ElementComponent } from "./ElementComponent"
import { ElementType } from "./Elements"
import { WeaponType } from "../../characters/weapons/WeaponType"
import { Player } from "../../characters/Player"
import { ElementFactory } from "./ElementFactory"
import { Component } from "../../../engine/Component"
import { WorldTime } from "../WorldTime"
import { TimeUnit } from "../TimeUnit"
import { LocationManager } from "../LocationManager"
import { GroundType } from "../ground/Ground"
import { Sounds } from "../../audio/Sounds"
import { Lists } from "../../../engine/util/Lists"
import { assets } from "../../../engine/Assets"

const NEXT_GROWTH_TIME = "ngt"
const SIZE = "s"  // one of [1, 2, 3]
const AVAILABLE_RESOURCES = "a"
const CHOPPING_AUDIO = Lists.range(0, 5).map(n => `audio/impact/impactPlank_medium_00${n}.ogg`)
const CHOPPING_AUDIO_VOLUME = .3

export class TreeFactory extends ElementFactory {

    readonly type: ElementType.TREE_ROUND|ElementType.TREE_POINTY
    readonly dimensions = new Point(1, 2)

    constructor(type: ElementType.TREE_ROUND|ElementType.TREE_POINTY) {
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
            const tile = e.addComponent(new TileComponent(
                Tilesets.instance.outdoorTiles.getTileSource(s), 
                new TileTransform(pos.times(TILE_SIZE).plus(randomOffset))
            ))
            tile.transform.depth = depth
            return tile
        }

        const prefix = this.type === ElementType.TREE_ROUND ? "treeRound" : "treePointy"
        let tiles: TileComponent[]
        if (size === 3) {
            tiles = [addTile(`${prefix}Top`, pos), addTile(`${prefix}Base`, pos.plus(new Point(0, 1)))]
        } else {
            tiles = [addTile(`${prefix}${["Sapling", "Small"][size-1]}`, pos.plus(new Point(0, 1)))]
        }

        const mirrored = Math.random() > .5
        tiles.forEach(t => t.transform.mirrorX = mirrored)
        
        const hitboxDims = new Point(8, 3)
        e.addComponent(new BoxCollider(
            pos.plus(new Point(.5, 2)).times(TILE_SIZE).minus(new Point(hitboxDims.x/2, hitboxDims.y)).plus(randomOffset), 
            hitboxDims
        ))

        const saplingType = this.type === ElementType.TREE_ROUND ? Item.ROUND_SAPLING : Item.POINTY_SAPLING

        const hittableCenter = pos.times(TILE_SIZE).plus(new Point(TILE_SIZE/2, TILE_SIZE + TILE_SIZE/2)).plus(randomOffset)  // center of bottom tile
        const hittableResource = e.addComponent(new HittableResource(
            hittableCenter, tiles.map(t => t.transform), availableResources, maxResourcesCount, 
            () => {
                if (size === 1 || (size === 2 && Math.random() > .5)) {
                    return []
                }
                const getItem = () => Math.random() < .2 ? saplingType : Item.WOOD
                if (Player.instance.dude.weaponType === WeaponType.AXE) {
                    return [getItem(), getItem()]
                } else {
                    return [getItem()]
                }
            },
            () => Sounds.play(Lists.oneOf(CHOPPING_AUDIO), CHOPPING_AUDIO_VOLUME)
        ))

        if (size < 3) {
            e.addComponent(new GrowableTree(nextGrowthTime, () => {
                e.selfDestruct()
                wl.addElement(this.type, pos, {
                    [NEXT_GROWTH_TIME]: this.nextGrowthTime(),
                    [SIZE]: Math.min(size + 1, 3),
                    [AVAILABLE_RESOURCES]: hittableResource.freeResources,
                })
            }))
        }

        return e.addComponent(new ElementComponent(
            this.type, 
            pos,
            [pos.plusY(1)], 
            () => { return { 
                [NEXT_GROWTH_TIME]: nextGrowthTime,
                [SIZE]: size,
                [AVAILABLE_RESOURCES]: hittableResource.freeResources,
            } }
        ))
    }

    canPlaceInLocation(wl: WorldLocation) {
        return wl === LocationManager.instance.exterior()
    }

    canPlaceAtPos(pos: Point) {
        return LocationManager.instance.currentLocation.ground.get(pos.plusY(1)).type === GroundType.GRASS
    }

    private nextGrowthTime() {
        // grow every 24-48 hours
        return WorldTime.instance.time + TimeUnit.DAY * (1 + Math.random())
    }
}

class GrowableTree extends Component {
    private nextGrowthTime: number;
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
