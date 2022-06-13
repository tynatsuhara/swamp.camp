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

/**
 * TODO:
 * - inflict damage
 */

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

        const addSprite = (spritePt: Point, offsetFromBottom: number) => {
            const position = pos.times(TILE_SIZE).plusY(offsetFromBottom)
            return e.addComponent(
                new SpriteComponent(
                    Tilesets.instance.outdoorTiles.getTileAt(spritePt),
                    SpriteTransform.new({
                        position,
                        depth: position.y + TILE_SIZE,
                        mirrorX: Math.random() > 0.5,
                    })
                )
            ).transform
        }

        let tileTransforms: SpriteTransform[] = []
        if (state === State.GROWING) {
            for (let i = 0; i < 2; i++) {
                const spritePt = new Point(Lists.oneOf([19, 20, 21]), 10)
                tileTransforms.push(addSprite(spritePt, i * -8))
            }
        } else {
            for (let i = 0; i < 2; i++) {
                const spritePt = new Point(Lists.oneOf([19, 20]), 9)
                tileTransforms.push(addSprite(spritePt, i * -8))
                if (state === State.HAS_BERRIES) {
                    tileTransforms.push(addSprite(new Point(20, 11), i * -8))
                }
            }
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

                if (openAdjacentSpots.length > 0 && Math.random() < 0.8) {
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
