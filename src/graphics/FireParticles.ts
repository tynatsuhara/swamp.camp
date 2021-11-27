import { Point } from "brigsby/dist/Point"
import { Lists } from "brigsby/dist/util/Lists"
import { RepeatedInvoker } from "brigsby/dist/util/RepeatedInvoker"
import { Color } from "../ui/Color"
import { Particles } from "./Particles"

const FIRE_DRIFT_DISTANCE = 2 //

export class FireParticles extends RepeatedInvoker {
    private lastPos: Point

    size: number

    constructor(
        size: number,
        positionSupplier: () => Point,
        depthSupplier: () => number = undefined
    ) {
        super(() => this.emit(positionSupplier, depthSupplier))

        this.size = size
        this.lastPos = positionSupplier()
    }

    private emit(positionSupplier: () => Point, depthSupplier: () => number) {
        const size = this.size
        const fireBase = positionSupplier()
        const diff = this.lastPos.minus(fireBase)
        const velocity = diff.equals(Point.ZERO)
            ? Point.ZERO
            : diff.normalized().times(FIRE_DRIFT_DISTANCE)
        const depth = depthSupplier ? depthSupplier() : fireBase.y

        // smoke
        const smokes = (Math.random() * (size + 1) - 1) * 0.4
        for (let i = 0; i < smokes; i++) {
            const speed = Math.random() > 0.5 ? -0.01 : -0.007
            Particles.instance.emitParticle(
                Lists.oneOf([Color.BROWN, Color.DARK_BROWN, Color.BLACK, Color.BLACK]),
                fireBase.randomCircularShift(1 + size / 2).plusY(-1),
                depth - 1,
                500 + Math.random() * 1500,
                (t) => new Point(0, t * speed),
                Math.random() > 0.5 ? new Point(2, 2) : new Point(1, 1)
            )
        }

        // fire
        for (let i = 0; i < size; i++) {
            const speed = -0.005
            Particles.instance.emitParticle(
                Lists.oneOf([Color.ORANGE, Color.SUPER_ORANGE, Color.LIGHT_ORANGE]),
                Point.ZERO.randomCircularShift(size),
                depth,
                600,
                (t) => new Point(velocity.x, velocity.y + speed * t),
                Math.random() > 0.5 ? new Point(2, 2) : new Point(1, 1),
                positionSupplier
            )
        }

        this.lastPos = fireBase

        return 50 // millis between emissions
    }
}
