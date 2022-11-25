import { Point, UpdateData } from "brigsby/dist"
import { PointValue } from "brigsby/dist/Point"
import { Lists, RepeatedInvoker } from "brigsby/dist/util"
import { FireParticles } from "../../graphics/particles/FireParticles"
import { Particles } from "../../graphics/particles/Particles"
import { TILE_SIZE } from "../../graphics/Tilesets"
import { session } from "../../online/session"
import { Color } from "../../ui/Color"
import { LightManager } from "../LightManager"
import { here } from "../locations/LocationManager"
import { WorldTime } from "../WorldTime"
import { Campfire } from "./Campfire"
import { ElementComponent } from "./ElementComponent"

const INTERVAL = 5_000
const TIME_UNTIL_DESTROY = 15_000

export class Burnable extends RepeatedInvoker {
    private pts: Point[]
    private burning: boolean
    private burnStart: number
    private depth: number
    private lighting = false
    private timeToLight = 500 + Math.random() * 1000
    private initialBurning: boolean

    get isBurning() {
        return this.burning
    }

    constructor(initialBurning: boolean, pts: Point[]) {
        super(() => {
            if (this.burning && session.isHost()) {
                // spread to adjacent squares
                this.pts.forEach((pt) => {
                    const adjacent = [pt.plusX(1), pt.plusX(-1), pt.plusY(1), pt.plusY(-1)]
                    adjacent.forEach((adj) => {
                        if (Math.random() < 0.3) {
                            here().getElement(adj)?.entity.getComponent(Burnable)?.burn(null, true)
                        }
                    })
                })
            }
            // we only really care about one delayed invocation
            return INTERVAL
        }, INTERVAL + Math.random() * INTERVAL)

        this.initialBurning = initialBurning
        this.pts = pts
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

        if (WorldTime.instance.time - this.burnStart > TIME_UNTIL_DESTROY) {
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
        this.burnStart = WorldTime.instance.time
        this.pts.forEach((pt) => {
            const burnableCenter = pt.plus(new Point(0.5, 0.5)).times(TILE_SIZE)
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
