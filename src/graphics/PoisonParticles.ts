import { Point } from "brigsby/dist/Point"
import { Lists } from "brigsby/dist/util/Lists"
import { RepeatedInvoker } from "brigsby/dist/util/RepeatedInvoker"
import { Color } from "../ui/Color"
import { Particles } from "./Particles"

export class PoisonParticles extends RepeatedInvoker {
    private lastPos: Point

    size: number

    constructor(size: number, positionSupplier: () => Point, depthSupplier?: () => number) {
        super(() => this.emit(positionSupplier, depthSupplier))

        this.size = size
        this.lastPos = positionSupplier()
    }

    private emit(positionSupplier: () => Point, depthSupplier?: () => number) {
        const size = this.size
        const basePosition = positionSupplier()
        if (!depthSupplier) {
            depthSupplier = () => basePosition.y
        }
        const depth = depthSupplier()

        const driftingParticles = (Math.random() * (size + 1) - 1) * 0.4
        for (let i = 0; i < driftingParticles; i++) {
            const speed = Math.random() > 0.5 ? -0.01 : -0.002
            Particles.instance.emitParticle(
                Lists.oneOf([Color.GREEN_5, Color.GREEN_6]),
                basePosition.randomCircularShift(1 + size / 2).plusY(-1),
                depth - 1,
                500 + Math.random() * 1500,
                (t) => new Point(0, t * speed),
                Math.random() > 0.5 ? new Point(2, 2) : new Point(1, 1)
            )
        }

        // particles which track the source
        for (let i = 0; i < (size * 2) / 5; i++) {
            const speed = -0.002
            const baseOffset = Point.ZERO.randomCircularShift(size)
            Particles.instance.emitComplexParticle(
                Lists.oneOf([Color.GREEN_5, Color.GREEN_6]),
                () => positionSupplier().plus(baseOffset),
                depthSupplier,
                600,
                (t) => new Point(0, speed * t),
                Math.random() > 0.5 ? new Point(2, 2) : new Point(1, 1)
            )
        }

        this.lastPos = basePosition

        return 50 // millis between emissions
    }
}
