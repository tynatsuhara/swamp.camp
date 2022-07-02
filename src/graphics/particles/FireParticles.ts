import { Point } from "brigsby/dist"
import { Lists, RepeatedInvoker } from "brigsby/dist/util"
import { Color } from "../../ui/Color"
import { Particles } from "./Particles"

const FIRE_DRIFT_DISTANCE = 1.5
const FIRE_COLORS = [Color.RED_3, Color.RED_4, Color.RED_5]

export class FireParticles extends RepeatedInvoker {
    private lastPos: Point

    size: number

    constructor(radius: number, positionSupplier: () => Point, depthSupplier?: () => number) {
        super(() => this.emit(positionSupplier, depthSupplier))

        this.size = radius
        this.lastPos = positionSupplier()
    }

    private emit(positionSupplier: () => Point, depthSupplier?: () => number) {
        const size = this.size
        const fireBase = positionSupplier()
        const diff = this.lastPos.minus(fireBase)
        const velocity = diff.equals(Point.ZERO)
            ? Point.ZERO
            : diff.normalized().times(FIRE_DRIFT_DISTANCE)
        if (!depthSupplier) {
            depthSupplier = () => fireBase.y
        }
        const depth = depthSupplier()

        // smoke
        const smokes = (Math.random() * (size + 1) - 1) * 0.4
        for (let i = 0; i < smokes; i++) {
            const speed = Math.random() > 0.5 ? -0.01 : -0.007
            Particles.instance.emitParticle(
                Lists.oneOf([Color.TAUPE_2, Color.TAUPE_1, Color.BLACK, Color.BLACK]),
                fireBase.randomCircularShift(1 + size / 2).plusY(-1),
                depth - 1,
                500 + Math.random() * 1500,
                (t) => new Point(0, t * speed),
                Math.random() > 0.5 ? new Point(2, 2) : new Point(1, 1)
            )
        }

        // drifting fire particles
        for (let i = 0; i < size / 2; i++) {
            const speed = -0.005
            Particles.instance.emitParticle(
                Lists.oneOf(FIRE_COLORS),
                fireBase.randomCircularShift(size),
                depth,
                150 + Math.random() * 100,
                (t) => new Point(velocity.x, velocity.y + speed * t),
                Math.random() > 0.5 ? new Point(2, 2) : new Point(1, 1)
            )
        }

        // fire particles which track the source
        for (let i = 0; i < (size * 2) / 3; i++) {
            const speed = -0.005
            const baseOffset = Point.ZERO.randomCircularShift(size)
            Particles.instance.emitComplexParticle(
                Lists.oneOf(FIRE_COLORS),
                () => positionSupplier().plus(baseOffset),
                depthSupplier,
                600,
                (t) => new Point(velocity.x, velocity.y + speed * t),
                Math.random() > 0.5 ? new Point(2, 2) : new Point(1, 1)
            )
        }

        this.lastPos = fireBase

        return 50 // millis between emissions
    }
}
