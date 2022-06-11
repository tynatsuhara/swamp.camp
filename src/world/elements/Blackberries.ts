import { Entity } from "brigsby/dist/Entity"
import { Point } from "brigsby/dist/Point"
import { SpriteComponent } from "brigsby/dist/sprites/SpriteComponent"
import { SpriteTransform } from "brigsby/dist/sprites/SpriteTransform"
import { Lists } from "brigsby/dist/util/Lists"
import { Tilesets, TILE_SIZE } from "../../graphics/Tilesets"
import { Item, spawnItem } from "../../items/Items"
import { Ground, GroundType } from "../ground/Ground"
import { Location } from "../Location"
import { camp } from "../LocationManager"
import { TimeUnit } from "../TimeUnit"
import { WorldTime } from "../WorldTime"
import { ElementComponent } from "./ElementComponent"
import { ElementFactory } from "./ElementFactory"
import { ElementType } from "./Elements"
import { Growable } from "./Growable"
import { Hittable } from "./Hittable"

enum State {
    GROWING,
    NO_BERRIES,
    HAS_BERRIES,
}

type SaveData = {
    // next growth time
    ngt?: number
    // state
    s?: State
}

export class BlackberriesFactory extends ElementFactory<SaveData> {
    readonly type = ElementType.BLACKBERRIES
    readonly dimensions = new Point(1, 1)

    make(wl: Location, pos: Point, data: SaveData): ElementComponent<SaveData> {
        let nextGrowthTime = data.ngt ?? this.determineNextGrowthTime()
        const state = data.s ?? State.GROWING

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

        let tileTransforms: SpriteTransform[]
        if (state === State.GROWING) {
            tileTransforms = [addTile(new Point(19, 10), false, 0).transform]
        } else {
            const sprites = [new Point(19, 9)]
            if (state === State.HAS_BERRIES) {
                sprites.push(new Point(20, 9))
            }
            tileTransforms = sprites.map((pt) => addTile(pt, true, 1).transform)
        }

        const center = pos.times(TILE_SIZE).plus(new Point(TILE_SIZE / 2, TILE_SIZE / 2))
        e.addComponent(
            new Hittable(center, tileTransforms, (dir) => {
                e.selfDestruct()
                if (state === State.HAS_BERRIES) {
                    const itemDirection = dir.randomlyShifted(0.2).normalized()
                    spawnItem(
                        pos
                            .times(TILE_SIZE)
                            .plusY(TILE_SIZE)
                            .plusX(TILE_SIZE / 2),
                        Item.BLACKBERRIES,
                        itemDirection.times(5)
                    )
                    wl.addElement(this.type, pos, {
                        s: State.NO_BERRIES,
                    })
                } else {
                    // TODO: Add destruction particles
                }
            })
        )

        e.addComponent(
            new Growable(nextGrowthTime, () => {
                const adjacentSpots = [pos.plusX(1), pos.plusX(-1), pos.plusY(1), pos.plusY(-1)]
                const openAdjacentSpots = adjacentSpots.filter(
                    (pt) => wl.getGround(pt)?.type === GroundType.GRASS && !wl.getElement(pt)
                )

                if (openAdjacentSpots.length > 0 && Math.random() < 0.5) {
                    wl.addElement(this.type, Lists.oneOf(openAdjacentSpots))
                    nextGrowthTime = this.determineNextGrowthTime()
                    return nextGrowthTime
                } else {
                    e.selfDestruct()
                    wl.addElement(this.type, pos, {
                        s: state === State.GROWING ? State.NO_BERRIES : State.HAS_BERRIES,
                    })
                }
            })
        )

        return e.addComponent(
            new ElementComponent(this.type, pos, () => ({
                ngt: nextGrowthTime,
                s: state,
            }))
        )
    }

    canPlaceInLocation(wl: Location) {
        return wl === camp()
    }

    canPlaceAtPos(wl: Location, pos: Point) {
        return Ground.isNaturalGround(wl.getGround(pos)?.type)
    }

    private determineNextGrowthTime() {
        // grow every 12-24 hours
        return WorldTime.instance.time + TimeUnit.DAY * (0.5 + Math.random() / 2)
    }
}
