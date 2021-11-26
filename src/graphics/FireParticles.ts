import { Point } from "brigsby/dist/Point"
import { Lists } from "brigsby/dist/util/Lists"
import { RepeatedInvoker } from "brigsby/dist/util/RepeatedInvoker"
import { Color } from "../ui/Color"
import { Particles } from "./Particles"

const FIRE_FOLLOW_SPEED = 1 // 0-1

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
                fireBase.randomCircularShift(size),
                depth,
                600,
                (t) =>
                    this.lastPos
                        .minus(fireBase)
                        // .times(FIRE_FOLLOW_SPEED)
                        .plusY(t * speed),
                Math.random() > 0.5 ? new Point(2, 2) : new Point(1, 1)
            )
        }

        this.lastPos = fireBase

        return 50 // millis between emissions
    }
}
