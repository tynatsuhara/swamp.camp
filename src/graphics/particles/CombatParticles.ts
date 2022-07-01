import { Point } from "brigsby/dist/Point"
import { Lists } from "brigsby/dist/util/Lists"
import { Dude } from "../../characters/Dude"
import { Color } from "../../ui/Color"
import { Particles } from "./Particles"

export const emitBlockParticles = (dude: Dude) => {
    const particles = 5 + Math.random() * 5
    for (let i = 0; i < particles; i++) {
        const lifeSpan = 120

        let offset = Point.ZERO.randomCircularShift(1)
        offset = new Point(Math.abs(offset.x) * dude.getFacingMultiplier(), offset.y)

        Particles.instance.emitComplexParticle(
            Lists.oneOf([Color.WHITE, Color.RED_5]),
            () =>
                dude.standingPosition
                    .plus(offset)
                    .plus(new Point(dude.getFacingMultiplier() * 4, -7)),
            () => dude.standingPosition.y + 1,
            lifeSpan,
            (t) => offset.times(t * 0.08),
            new Point(1, 1)
        )
    }
}
