import { Point } from "brigsby/dist/Point"
import { Lists } from "brigsby/dist/util/Lists"
import { Color } from "../../ui/Color"
import { Particles } from "./Particles"

export const DARK_SMOKE_PARTICLES = [Color.BLACK, Color.BLUE_1, Color.BLUE_2, Color.BLUE_3]
export const LIGHT_SMOKE_PARTICLES = [Color.TAUPE_5, Color.TAUPE_6, Color.WHITE, Color.WHITE]

export const emitApparitionParticles = (standingPosition: Point, colors = DARK_SMOKE_PARTICLES) => {
    for (let i = 0; i < 180; i++) {
        const speed = Math.random() > 0.5 ? -0.005 : -0.004
        Particles.instance.emitParticle(
            Lists.oneOf(colors),
            standingPosition.randomCircularShift(10).plusY(-8),
            standingPosition.y + 2,
            250 + Math.random() * 1000,
            (t) => new Point(0, t * speed),
            Math.random() > 0.5 ? new Point(2, 2) : new Point(1, 1)
        )
    }
}
