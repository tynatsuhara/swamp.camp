import { Point, UpdateData } from "brigsby/dist"
import { PointValue } from "brigsby/dist/Point"
import { Lists, RepeatedInvoker } from "brigsby/dist/util"
import { TILE_SIZE } from "../../graphics/Tilesets"
import { FireParticles } from "../../graphics/particles/FireParticles"
import { Particles } from "../../graphics/particles/Particles"
import { session } from "../../online/session"
import { Color } from "../../ui/Color"
import { adjacent } from "../../utils/misc"
import { LightManager } from "../LightManager"
import { now } from "../WorldTime"
import { here } from "../locations/LocationManager"
import { Campfire } from "./Campfire"
import { ElementComponent } from "./ElementComponent"

const INTERVAL = 5_000
const TIME_UNTIL_DESTROY = 15_000

export class Burnable extends RepeatedInvoker {
    private burning: boolean
    private burnStart: number
    private depth: number
    private lighting = false
    private timeToLight = 500 + Math.random() * 1000

    get isBurning() {
        return this.burning
    }

    constructor(
        private initialBurning: boolean,
        private pts: Point[],
        private offset: Point = Point.ZERO
    ) {
        super(() => {
            if (this.burning && session.isHost()) {
                // spread to adjacent squares
                this.pts.forEach((pt) => {
                    adjacent(pt).forEach((adj) => {
                        if (Math.random() < 0.3) {
                            here().getElement(adj)?.entity.getComponent(Burnable)?.burn(null, true)
                        }
                    })
                })
            }
            // we only really care about one delayed invocation
            return INTERVAL
        }, INTERVAL + Math.random() * INTERVAL)

        this.depth = Math.max(...pts.map((pt) => pt.y + 1)) * TILE_SIZE
    }

    start() {
        if (this.initialBurning) {
            this.burn(null, true)
        }

        this.burn = here().elementSyncFn(
            "burnable",
            this.entity.getComponent(ElementComponent).pos,
            this.burn.bind(this)
        )
    }

    update(updateData: UpdateData) {
        super.update(updateData)

        if (session.isGuest()) {
            return
        }

        if (now() - this.burnStart > TIME_UNTIL_DESTROY) {
            this.entity.selfDestruct()
        }

        if (this.lighting && !this.burning) {
            this.timeToLight -= updateData.elapsedTimeMillis
            this.lighting = false // needs to be set every tick
        }
    }

    burn(pt?: PointValue, immediately = false) {
        if (this.burning || (pt && !this.pts.some((p) => p.equals(pt)))) {
            return
        } else if (!immediately && this.timeToLight > 0) {
            this.lighting = true
            return
        }
        this.burning = true
        this.burnStart = now()
        this.pts.forEach((pt) => {
            const burnableCenter = pt.plus(new Point(0.5, 0.5)).times(TILE_SIZE).plus(this.offset)
            this.entity.addComponent(
                new FireParticles(
                    8,
                    () => burnableCenter,
                    () => this.depth
                )
            )
            LightManager.instance.addLight(
                here(),
                this.lightKeyForPoint(pt),
                burnableCenter,
                Campfire.getLightSizeForLogCount(3)
            )
        })
    }

    private lightKeyForPoint = (pt: Point) => `burnable:${pt}`

    isBurningAt(pt: Point) {
        return this.isBurning && this.pts.some((p) => p.equals(pt))
    }

    delete() {
        if (!this.isBurning) {
            return
        }

        // Emit ash particles
        this.pts.forEach((pt) => {
            const position = pt.plus(new Point(0.5, 0.5)).times(TILE_SIZE)
            for (let i = 0; i < 20; i++) {
                const speed = Math.random() > 0.5 ? 0.003 : 0.001
                Particles.instance.emitParticle(
                    Lists.oneOf([Color.TAUPE_2, Color.TAUPE_1, Color.BLACK, Color.BLACK]),
                    position.randomCircularShift(8).plusY(-4),
                    (pt.y + 1) * TILE_SIZE,
                    500 + Math.random() * 500,
                    (t) => new Point(0, t * speed),
                    Math.random() > 0.5 ? new Point(2, 2) : new Point(1, 1)
                )
            }

            // remove light sources
            LightManager.instance.removeLight(this.lightKeyForPoint(pt))
        })
    }
}
