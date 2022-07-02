import { Point } from "brigsby/lib"
import { Lists, RepeatedInvoker } from "brigsby/lib/util"
import { Color } from "../../ui/Color"
import { Particles } from "./Particles"

const COLORS = [Color.BLACK, Color.TAUPE_1]

export class BlackLungParticles extends RepeatedInvoker {
    constructor(positionSupplier: () => Point, depthSupplier?: () => number) {
        super(() => this.emit(positionSupplier, depthSupplier))
    }

    private emit(positionSupplier: () => Point, depthSupplier?: () => number) {
        const basePosition = positionSupplier()
        if (!depthSupplier) {
            depthSupplier = () => basePosition.y
        }
        const depth = depthSupplier()

        for (let i = 0; i < 1; i++) {
            const speed = Math.random() > 0.5 ? -0.01 : -0.002
            Particles.instance.emitParticle(
                Lists.oneOf(COLORS),
                basePosition.randomCircularShift(4).plusY(-1),
                depth - 1,
                500 + Math.random() * 1500,
                (t) => new Point(0, t * speed),
                Math.random() > 0.5 ? new Point(2, 2) : new Point(1, 1)
            )
        }

        // particles which track the source
        for (let i = 0; i < 1; i++) {
            const speed = -0.002
            const baseOffset = Point.ZERO.randomCircularShift(4)
            Particles.instance.emitComplexParticle(
                Lists.oneOf(COLORS),
                () => positionSupplier().plus(baseOffset),
                depthSupplier,
                600,
                (t) => new Point(0, speed * t),
                Math.random() > 0.5 ? new Point(2, 2) : new Point(1, 1)
            )
        }

        return 300 // millis between emissions
    }
}
