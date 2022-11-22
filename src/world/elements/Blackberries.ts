import { Entity, Point } from "brigsby/dist"
import { SpriteComponent, SpriteTransform } from "brigsby/dist/sprites"
import { Lists } from "brigsby/dist/util"
import { Particles } from "../../graphics/particles/Particles"
import { Tilesets, TILE_SIZE } from "../../graphics/Tilesets"
import { Item, spawnItem } from "../../items/Items"
import { session } from "../../online/session"
import { Color } from "../../ui/Color"
import { Ground, GroundType } from "../ground/Ground"
import { Location } from "../locations/Location"
import { camp } from "../locations/LocationManager"
import { TimeUnit } from "../TimeUnit"
import { WorldTime } from "../WorldTime"
import { Burnable } from "./Burnable"
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
    // burning
    b?: boolean
}

export class BlackberriesFactory extends ElementFactory<ElementType.BLACKBERRIES, SaveData> {
    readonly dimensions = new Point(1, 1)

    constructor() {
        super(ElementType.BLACKBERRIES)
    }

    make(
        wl: Location,
        pos: Point,
        data: SaveData
    ): ElementComponent<ElementType.BLACKBERRIES, SaveData> {
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

        const emitBreakParticles = () => {
            const position = pos.plus(new Point(0.5, 0.5)).times(TILE_SIZE)
            for (let i = 0; i < 20; i++) {
                const speed = Math.random() > 0.5 ? 0.01 : 0.02
                Particles.instance.emitParticle(
                    Lists.oneOf([Color.GREEN_4, Color.GREEN_6, Color.GREEN_6]),
                    position.randomCircularShift(8).plusY(-4),
                    (pos.y + 1) * TILE_SIZE,
                    200 + Math.random() * 200,
                    (t) => new Point(0, t * speed),
                    Math.random() > 0.5 ? new Point(2, 2) : new Point(1, 1)
                )
            }
        }

        const center = pos.times(TILE_SIZE).plus(new Point(TILE_SIZE / 2, TILE_SIZE / 2))
        e.addComponent(
            new Hittable(center, tileTransforms, (dir) => {
                e.selfDestruct()
                if (state === State.HAS_BERRIES) {
                    if (session.isHost()) {
                        const itemDirection = dir.randomlyShifted(0.2).normalized()
                        spawnItem({
                            pos: pos
                                .times(TILE_SIZE)
                                .plusY(TILE_SIZE)
                                .plusX(TILE_SIZE / 2),
                            item: Item.BLACKBERRIES,
                            velocity: itemDirection.times(5),
                        })
                        wl.addElement(this.type, pos, {
                            s: State.NO_BERRIES,
                        })
                    }
                } else {
                    emitBreakParticles()
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
                } else if (Math.random() < 0.3) {
                    // No-op. It will take a while to grow
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

        const burnable = e.addComponent(new Burnable(data.b ?? false, [pos]))

        return e.addComponent(
            new ElementComponent(this.type, pos, () => ({
                ngt: nextGrowthTime,
                s: state,
                b: burnable.isBurning ? true : undefined,
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
