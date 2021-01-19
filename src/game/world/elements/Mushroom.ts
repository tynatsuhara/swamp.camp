import { Point } from "../../../engine/point"
import { TILE_SIZE, Tilesets } from "../../graphics/Tilesets"
import { BoxCollider } from "../../../engine/collision/BoxCollider"
import { WorldLocation } from "../WorldLocation"
import { TileComponent } from "../../../engine/tiles/TileComponent"
import { TileTransform } from "../../../engine/tiles/TileTransform"
import { Entity } from "../../../engine/Entity"
import { Item, spawnItem } from "../../items/Items"
import { HittableResource } from "./HittableResource"
import { ElementComponent } from "./ElementComponent"
import { ElementType } from "./Elements"
import { WeaponType } from "../../characters/weapons/WeaponType"
import { Player } from "../../characters/Player"
import { ElementFactory } from "./ElementFactory"
import { Component } from "../../../engine/component"
import { WorldTime } from "../WorldTime"
import { TimeUnit } from "../TimeUnit"
import { LocationManager } from "../LocationManager"
import { GroundType } from "../ground/Ground"
import { Hittable } from "./Hittable"
import { DudeFactory, DudeType } from "../../characters/DudeFactory"

const NEXT_GROWTH_TIME = "ngt"

export class MushroomFactory extends ElementFactory {

    readonly type = ElementType.MUSHROOM
    readonly dimensions = new Point(1, 1)

    make(wl: WorldLocation, pos: Point, data: object): ElementComponent {
        const nextGrowthTime = data[NEXT_GROWTH_TIME] ?? this.nextGrowthTime()

        const e = new Entity()
        const depth = (pos.y + 1) * TILE_SIZE
        const randomOffset = new Point(0, -4).randomlyShifted(3, 3)

        const addTile = (s: string, pos: Point) => {
            const tile = e.addComponent(new TileComponent(
                Tilesets.instance.outdoorTiles.getTileSource(s), 
                new TileTransform(pos.times(TILE_SIZE).plus(randomOffset))
            ))
            tile.transform.depth = depth
            return tile
        }

        let tile: TileComponent = addTile("mushroomPlaced", pos)
        
        const hittableCenter = pos.times(TILE_SIZE).plus(new Point(TILE_SIZE/2, TILE_SIZE/2))
        e.addComponent(
            new Hittable(hittableCenter, [tile.transform], (dir) => {
                e.selfDestruct()
                const itemDirection = dir.randomlyShifted(.2).normalized()
                spawnItem(pos.times(TILE_SIZE).plusY(TILE_SIZE).plusX(TILE_SIZE/2), Item.MUSHROOM, itemDirection.times(5))
            })
        )

        e.addComponent(
            new GrowableShroom(nextGrowthTime, () => {
                e.selfDestruct()
                DudeFactory.instance.new(
                    DudeType.SHROOM, 
                    pos.times(TILE_SIZE).plusY(-TILE_SIZE).plusX(-TILE_SIZE/2), 
                    LocationManager.instance.exterior()
                )
            })
        )

        return e.addComponent(new ElementComponent(
            this.type, 
            pos,
            [pos], 
            () => data
        ))
    }

    canPlace(pos: Point) {
        return LocationManager.instance.currentLocation.ground.get(pos.plusY(1)).type === GroundType.GRASS
    }

    private nextGrowthTime() {
        // grow every 12-24 hours
        return WorldTime.instance.time + TimeUnit.DAY * (0.5 + Math.random()/2)
    }
}

class GrowableShroom extends Component {
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
