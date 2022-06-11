import { Entity } from "brigsby/dist/Entity"
import { Point } from "brigsby/dist/Point"
import { SpriteComponent } from "brigsby/dist/sprites/SpriteComponent"
import { SpriteTransform } from "brigsby/dist/sprites/SpriteTransform"
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

type SaveData = {
    // next growth time
    ngt?: number
    // has berries (undefined if bush isn't fully grown yet)
    hb?: boolean
}

export class BlackberriesFactory extends ElementFactory<SaveData> {
    readonly type = ElementType.BLACKBERRIES
    readonly dimensions = new Point(1, 1)

    make(wl: Location, pos: Point, data: SaveData): ElementComponent<SaveData> {
        const nextGrowthTime = data.ngt ?? this.nextGrowthTime()
        const hasBerries = data.hb ?? false

        const e = new Entity()

        const addTile = (pt: Point, mirrorY: boolean, depthOffset: number) =>
            e.addComponent(
                new SpriteComponent(
                    Tilesets.instance.outdoorTiles.getTileAt(pt),
                    SpriteTransform.new({
                        position: pos.times(TILE_SIZE),
                        depth: (pos.y + depthOffset) * TILE_SIZE,
                        mirrorX: Math.random() > 0.5,
                        mirrorY: mirrorY && Math.random() > 0.5,
                    })
                )
            )

        // const tileTransforms = [new Point(19, 9), new Point(20, 9)].map(
        //     (pt) => addTile(pt, true).transform
        // )

        const tileTransforms =
            nextGrowthTime === -1
                ? [new Point(19, 9) /*, new Point(20, 9)*/].map(
                      (pt) => addTile(pt, true, 1).transform
                  )
                : [addTile(new Point(19, 10), false, 0).transform]

        const hittableCenter = pos.times(TILE_SIZE).plus(new Point(TILE_SIZE / 2, TILE_SIZE / 2))
        e.addComponent(
            new Hittable(hittableCenter, tileTransforms, (dir) => {
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

        if (nextGrowthTime !== -1) {
            e.addComponent(
                new Growable(nextGrowthTime, () => {
                    e.selfDestruct()
                    wl.addElement(ElementType.BLACKBERRIES, pos, { ngt: -1 })
                })
            )
        }

        return e.addComponent(
            new ElementComponent(this.type, pos, () => ({
                ngt: nextGrowthTime,
                hb: hasBerries,
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
