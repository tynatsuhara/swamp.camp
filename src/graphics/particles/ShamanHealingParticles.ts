import { Point } from "brigsby/dist/Point"
import { Lists } from "brigsby/dist/util/Lists"
import { RepeatedInvoker } from "brigsby/dist/util/RepeatedInvoker"
import { Dude } from "../../characters/Dude"
import { Color } from "../../ui/Color"
import { Particles } from "./Particles"

const DRIFT_DISTANCE = 2
const COLORS = [Color.BLUE_5, Color.BLUE_6]

export class ShamanHealingParticles extends RepeatedInvoker {
    constructor() {
        let dude: Dude
        let lastPos: Point

        super(() => {
            dude ??= this.entity.getComponent(Dude)
            lastPos ??= dude.standingPosition

            // particles on shaman
            const size = 8
            const positionSupplier = () => dude.standingPosition.plusY(-8)
            const fireBase = positionSupplier()
            const diff = lastPos.minus(fireBase)
            const velocity = diff.normalizedOrZero().times(DRIFT_DISTANCE)
            const depthSupplier = () => dude.standingPosition.y + 1
            const depth = depthSupplier()

            // drifting fire particles
            for (let i = 0; i < size / 2; i++) {
                const speed = -0.01
                Particles.instance.emitParticle(
                    Lists.oneOf(COLORS),
                    fireBase.randomCircularShift(size),
                    depth,
                    200 + Math.random() * 400,
                    (t) => new Point(velocity.x, velocity.y + speed * t),
                    Math.random() > 0.5 ? new Point(2, 2) : new Point(1, 1)
                )
            }

            // fire particles which track the source
            for (let i = 0; i < 3; i++) {
                const speed = -0.005
                const baseOffset = Point.ZERO.randomCircularShift(size)
                Particles.instance.emitComplexParticle(
                    Lists.oneOf(COLORS),
                    () => positionSupplier().plus(baseOffset),
                    depthSupplier,
                    700,
                    (t) => new Point(velocity.x, velocity.y + speed * t),
                    Math.random() > 0.5 ? new Point(2, 2) : new Point(1, 1)
                )
            }

            lastPos = fireBase

            return 150 // millis between emissions
        })
    }
}
