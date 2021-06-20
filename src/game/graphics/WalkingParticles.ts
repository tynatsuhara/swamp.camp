import { Component } from "../../engine/Component"
import { debug } from "../../engine/Debug"
import { UpdateData } from "../../engine/Engine"
import { Point } from "../../engine/Point"
import { Dude } from "../characters/Dude"
import { Color } from "../ui/Color"
import { GroundRenderer } from "../world/GroundRenderer"
import { LocationManager } from "../world/LocationManager"
import { Particles } from "./Particles"

const MILLIS_BETWEEN_EMISSIONS = 50
const LIFESPAN_MILLIS = 300
const BLOOD_PROBABILITY = .75

export class WalkingParticles extends Component {

    private dude: Dude
    private timeUntilNextEmission = 0

    awake() {
        this.dude = this.entity.getComponent(Dude)
    }

    update(updateData: UpdateData) {
        // TODO blood
        if (debug.enableBlood && this.dude.isAlive && this.dude.health < this.dude.maxHealth 
            && Math.random() > this.dude.health/this.dude.maxHealth && Math.random() < BLOOD_PROBABILITY) {
            Particles.instance.emitParticle(
                Math.random() > .9 ? Color.RED : Color.DARK_RED, 
                this.dude.standingPosition.randomCircularShift(4),
                GroundRenderer.DEPTH + 1,
                10_000 + Math.random() * 5_000,
                () => Point.ZERO,
                Math.random() > .5 ? new Point(2, 2) : new Point(1, 1),
            )
        }

        // Conditions for not showing walking particles
        if (!this.dude.isMoving || this.dude.isJumping || LocationManager.instance.currentLocation.isInterior) {
            // set to 0 so that particles will be emitted immediately once it makes sense
            this.timeUntilNextEmission = 0
            return
        }

        this.timeUntilNextEmission -= updateData.elapsedTimeMillis
        if (this.timeUntilNextEmission > 0) {
            return
        }

        Particles.instance.emitParticle(
            Color.LIGHT_BROWN, 
            this.dude.standingPosition
                    .randomlyShifted(4, 0)
                    .plusY(Math.random() * -5), 
            GroundRenderer.DEPTH + 1, 
            LIFESPAN_MILLIS,
            () => Point.ZERO,
            Math.random() > .5 ? new Point(2, 2) : new Point(1, 1),
        )

        this.timeUntilNextEmission = MILLIS_BETWEEN_EMISSIONS
    }
}