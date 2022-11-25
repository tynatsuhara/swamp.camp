import { Point } from "brigsby/dist"
import { pt } from "brigsby/dist/Point"
import { Lists } from "brigsby/dist/util"
import { Dude } from "../../characters/Dude"
import { syncFn } from "../../online/syncUtils"
import { Color } from "../../ui/Color"
import { Particles } from "./Particles"

export const emitBlockParticles = syncFn("prtcl:blk", (uuid: string) => {
    const dude = Dude.get(uuid)
    const particles = 5 + Math.random() * 5
    for (let i = 0; i < particles; i++) {
        const lifeSpan = 150

        let offset = Point.ZERO.randomCircularShift(1)
        offset = pt(Math.abs(offset.x) * dude.getFacingMultiplier(), offset.y)

        Particles.instance.emitComplexParticle(
            Lists.oneOf([Color.WHITE, Color.RED_5]),
            () => offset.plus(dude.standingPosition).plus(pt(dude.getFacingMultiplier() * 4, -7)),
            () => dude.standingPosition.y + 1,
            lifeSpan,
            (t) => offset.times(t * 0.08),
            pt(Math.random() > 0.5 ? 1 : 2)
        )
    }
})
