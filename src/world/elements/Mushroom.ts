import { Entity, Point } from "brigsby/dist"
import { SpriteComponent, SpriteTransform } from "brigsby/dist/sprites"
import { DudeFactory } from "../../characters/DudeFactory"
import { DudeType } from "../../characters/DudeType"
import { Tilesets, TILE_SIZE } from "../../graphics/Tilesets"
import { Item, spawnItem } from "../../items/Items"
import { session } from "../../online/session"
import { Ground } from "../ground/Ground"
import { Location } from "../locations/Location"
import { camp } from "../locations/LocationManager"
import { TimeUnit } from "../TimeUnit"
import { WorldTime } from "../WorldTime"
import { ElementComponent } from "./ElementComponent"
import { ElementFactory } from "./ElementFactory"
import { ElementType } from "./Elements"
import { Growable } from "./Growable"
import { Hittable } from "./Hittable"

export class MushroomFactory extends ElementFactory<ElementType.MUSHROOM, { ngt: number }> {
    readonly dimensions = new Point(1, 1)

    constructor() {
        super(ElementType.MUSHROOM)
    }

    make(wl: Location, pos: Point, { ngt = this.nextGrowthTime() }) {
        // const nextGrowthTime = data[NEXT_GROWTH_TIME] ?? this.nextGrowthTime()

        const e = new Entity()
        const randomOffset = new Point(0, -4).randomlyShifted(3, 3)

        const tile: SpriteComponent = e.addComponent(
            new SpriteComponent(
                Tilesets.instance.outdoorTiles.getTileSource("mushroomPlaced"),
                SpriteTransform.new({
                    position: pos.times(TILE_SIZE).plus(randomOffset),
                    depth: (pos.y + 1) * TILE_SIZE + randomOffset.y,
                })
            )
        )

        const hittableCenter = pos.times(TILE_SIZE).plus(new Point(TILE_SIZE / 2, TILE_SIZE / 2))
        e.addComponent(
            new Hittable(hittableCenter, [tile.transform], (dir) => {
                e.selfDestruct()
                const itemDirection = dir.randomlyShifted(0.2).normalized()
                if (session.isHost()) {
                    spawnItem({
                        pos: pos
                            .times(TILE_SIZE)
                            .plusY(TILE_SIZE)
                            .plusX(TILE_SIZE / 2),
                        item: Item.MUSHROOM,
                        velocity: itemDirection.times(5),
                    })
                }
            })
        )

        e.addComponent(
            new Growable(ngt, () => {
                e.selfDestruct()
                DudeFactory.instance.create(
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
                ngt,
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
        return Math.floor(WorldTime.instance.time + TimeUnit.DAY * (0.5 + Math.random() / 2))
    }
}
