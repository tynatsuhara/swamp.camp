import { Component } from "../../engine/Component"
import { UpdateData } from "../../engine/Engine"
import { Point } from "../../engine/Point"
import { Dude } from "../characters/Dude"
import { Color } from "../ui/Color"
import { GroundRenderer } from "../world/GroundRenderer"
import { Particles } from "./Particles"

const MILLIS_BETWEEN_EMISSIONS = 50
const LIFESPAN_MILLIS = 300

export class WalkingParticles extends Component {

    private dude: Dude
    private timeUntilNextEmission = 0

    awake() {
        this.dude = this.entity.getComponent(Dude)
    }

    update(updateData: UpdateData) {
        if (!this.dude.isMoving || this.dude.isJumping) {
            this.timeUntilNextEmission = 0
            return
        }

        this.timeUntilNextEmission -= updateData.elapsedTimeMillis
        if (this.timeUntilNextEmission > 0) {
            return
        }

        const xRange = 4

        Particles.instance.emitParticle(
            Color.LIGHT_BROWN, 
            this.dude.standingPosition
                    .plusX(Math.random() * xRange * 2 - xRange)
                    .plusY(Math.random() * -5), 
            GroundRenderer.DEPTH + 1, 
            LIFESPAN_MILLIS,
            () => Point.ZERO,
            Math.random() > .5 ? new Point(2, 2) : new Point(1, 1),
        )

        this.timeUntilNextEmission = MILLIS_BETWEEN_EMISSIONS
    }
}