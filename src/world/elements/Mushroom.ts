import { Component } from "brigsby/dist/Component"
import { Entity } from "brigsby/dist/Entity"
import { Point } from "brigsby/dist/Point"
import { SpriteComponent } from "brigsby/dist/sprites/SpriteComponent"
import { SpriteTransform } from "brigsby/dist/sprites/SpriteTransform"
import { DudeFactory, DudeType } from "../../characters/DudeFactory"
import { Tilesets, TILE_SIZE } from "../../graphics/Tilesets"
import { Item, spawnItem } from "../../items/Items"
import { GroundType } from "../ground/Ground"
import { LocationManager } from "../LocationManager"
import { TimeUnit } from "../TimeUnit"
import { WorldLocation } from "../WorldLocation"
import { WorldTime } from "../WorldTime"
import { ElementComponent } from "./ElementComponent"
import { ElementFactory } from "./ElementFactory"
import { ElementType } from "./Elements"
import { Hittable } from "./Hittable"

const NEXT_GROWTH_TIME = "ngt"

export class MushroomFactory extends ElementFactory {

    readonly type = ElementType.MUSHROOM
    readonly dimensions = new Point(1, 1)

    make(wl: WorldLocation, pos: Point, data: object): ElementComponent {
        const nextGrowthTime = data[NEXT_GROWTH_TIME] ?? this.nextGrowthTime()

        const e = new Entity()
        const randomOffset = new Point(0, -4).randomlyShifted(3, 3)
        const depth = (pos.y + 1) * TILE_SIZE + randomOffset.y

        const addTile = (s: string, pos: Point) => {
            const tile = e.addComponent(new SpriteComponent(
                Tilesets.instance.outdoorTiles.getTileSource(s), 
                new SpriteTransform(pos.times(TILE_SIZE).plus(randomOffset))
            ))
            tile.transform.depth = depth
            return tile
        }

        let tile: SpriteComponent = addTile("mushroomPlaced", pos)
        
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
            () => ({
                [NEXT_GROWTH_TIME]: nextGrowthTime
            })
        ))
    }

    canPlaceInLocation(wl: WorldLocation) {
        return wl === LocationManager.instance.exterior()
    }

    canPlaceAtPos(pos: Point) {
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
