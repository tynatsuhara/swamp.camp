import { Entity } from "brigsby/dist/Entity"
import { Point } from "brigsby/dist/Point"
import { SpriteComponent } from "brigsby/dist/sprites/SpriteComponent"
import { SpriteTransform } from "brigsby/dist/sprites/SpriteTransform"
import { DudeFactory, DudeType } from "../../characters/DudeFactory"
import { Tilesets, TILE_SIZE } from "../../graphics/Tilesets"
import { Item, spawnItem } from "../../items/Items"
import { Ground } from "../ground/Ground"
import { Location } from "../Location"
import { camp } from "../LocationManager"
import { TimeUnit } from "../TimeUnit"
import { WorldTime } from "../WorldTime"
import { ElementComponent } from "./ElementComponent"
import { ElementFactory } from "./ElementFactory"
import { ElementType } from "./Elements"
import { Growable } from "./Growable"
import { Hittable } from "./Hittable"

const NEXT_GROWTH_TIME = "ngt"

export class MushroomFactory extends ElementFactory {
    readonly type = ElementType.MUSHROOM
    readonly dimensions = new Point(1, 1)

    make(wl: Location, pos: Point, data: object): ElementComponent {
        const nextGrowthTime = data[NEXT_GROWTH_TIME] ?? this.nextGrowthTime()

        const e = new Entity()
        const randomOffset = new Point(0, -4).randomlyShifted(3, 3)
        const depth = (pos.y + 1) * TILE_SIZE + randomOffset.y

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

        let tile: SpriteComponent = addTile("mushroomPlaced", pos)

        const hittableCenter = pos.times(TILE_SIZE).plus(new Point(TILE_SIZE / 2, TILE_SIZE / 2))
        e.addComponent(
            new Hittable(hittableCenter, [tile.transform], (dir) => {
                e.selfDestruct()
                const itemDirection = dir.randomlyShifted(0.2).normalized()
                spawnItem(
                    pos
                        .times(TILE_SIZE)
                        .plusY(TILE_SIZE)
                        .plusX(TILE_SIZE / 2),
                    Item.MUSHROOM,
                    itemDirection.times(5)
                )
            })
        )

        e.addComponent(
            new Growable(nextGrowthTime, () => {
                e.selfDestruct()
                DudeFactory.instance.new(
                    DudeType.SHROOM,
                    pos
                        .times(TILE_SIZE)
                        .plusY(-TILE_SIZE)
                        .plusX(-TILE_SIZE / 2),
                    camp()
                )
            })
        )

        return e.addComponent(
            new ElementComponent(this.type, pos, () => ({
                [NEXT_GROWTH_TIME]: nextGrowthTime,
            }))
        )
    }

    canPlaceInLocation(wl: Location) {
        return wl === camp()
    }

    canPlaceAtPos(wl: Location, pos: Point) {
        return Ground.isNaturalGround(wl.getGround(pos)?.type)
    }

    private nextGrowthTime() {
        // grow every 12-24 hours
        return WorldTime.instance.time + TimeUnit.DAY * (0.5 + Math.random() / 2)
    }
}
