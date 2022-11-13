import { Point } from "brigsby/dist"
import { PointValue, pt } from "brigsby/dist/Point"
import { Lists } from "brigsby/dist/util"
import { syncFn } from "../../online/utils"
import { Color } from "../../ui/Color"
import { Particles } from "./Particles"

export const emitBlockParticles = syncFn(
    "blkprtcle",
    (facingMultiplier: number, standingPosition: PointValue) => {
        console.log("block particles")
        const particles = 5 + Math.random() * 5
        for (let i = 0; i < particles; i++) {
            const lifeSpan = 120

            let offset = Point.ZERO.randomCircularShift(1)
            offset = pt(Math.abs(offset.x) * facingMultiplier, offset.y)

            Particles.instance.emitComplexParticle(
                Lists.oneOf([Color.WHITE, Color.RED_5]),
                () => offset.plus(standingPosition).plus(pt(facingMultiplier * 4, -7)),
                () => standingPosition.y + 5,
                lifeSpan,
                (t) => offset.times(t * 0.08),
                pt(1)
            )
        }
    }
)
