import { Component } from "brigsby/dist/Component"
import { debug } from "brigsby/dist/Debug"
import { UpdateData } from "brigsby/dist/Engine"
import { Point } from "brigsby/dist/Point"
import { Dude } from "../characters/Dude"
import { Color } from "../ui/Color"
import { Ground } from "../world/ground/Ground"
import { GroundRenderer } from "../world/GroundRenderer"
import { LocationManager } from "../world/LocationManager"
import { Particles } from "./Particles"

const MILLIS_BETWEEN_EMISSIONS = 50
const LIFESPAN_MILLIS = 300
const BLOOD_PROBABILITY = 0.75

export class WalkingParticles extends Component {
    private dude: Dude
    private timeUntilNextEmission = 0

    awake() {
        this.dude = this.entity.getComponent(Dude)
    }

    update(updateData: UpdateData) {
        // TODO blood
        if (
            debug.enableBlood &&
            this.dude.isAlive &&
            this.dude.health < this.dude.maxHealth &&
            Math.random() > this.dude.health / this.dude.maxHealth &&
            Math.random() < BLOOD_PROBABILITY
        ) {
            Particles.instance.emitParticle(
                Math.random() > 0.9 ? Color.RED_3 : Color.RED_2,
                this.dude.standingPosition.randomCircularShift(4),
                GroundRenderer.DEPTH + 1,
                10_000 + Math.random() * 5_000,
                () => Point.ZERO,
                Math.random() > 0.5 ? new Point(2, 2) : new Point(1, 1)
            )
        }

        const doNotShowParticles =
            this.dude.jumping || LocationManager.instance.currentLocation.isInterior

        if (doNotShowParticles) {
            // set to 0 so that particles will be emitted immediately once it makes sense
            this.timeUntilNextEmission = 0
            return
        }

        this.timeUntilNextEmission -= updateData.elapsedTimeMillis
        if (this.timeUntilNextEmission > 0) {
            return
        }

        const groud = LocationManager.instance.currentLocation.getGround(this.dude.tile)

        if (Ground.isWater(groud?.type)) {
            const depth = this.dude.standingPosition.y + 6
            const xRange = this.dude.colliderSize.x - 1
            for (let i = 0; i < 15; i++) {
                Particles.instance.emitParticle(
                    Color.BLUE_6,
                    this.dude.standingPosition.randomlyShifted(xRange, 3).plusY(-2),
                    depth,
                    LIFESPAN_MILLIS,
                    () => Point.ZERO,
                    new Point(3, 3)
                )
            }
            Particles.instance.emitParticle(
                Math.random() < 0.7 ? Color.BLUE_5 : Color.WHITE,
                this.dude.standingPosition.randomlyShifted(xRange, 3).plusY(-2),
                depth + 1,
                LIFESPAN_MILLIS,
                () => Point.ZERO,
                new Point(1, 1)
            )
        } else {
            if (!this.dude.isMoving) {
                this.timeUntilNextEmission = 0
                return
            }

            Particles.instance.emitParticle(
                Color.TAUPE_5,
                this.dude.standingPosition.randomlyShifted(4, 0).plusY(Math.random() * -5),
                GroundRenderer.DEPTH + 1,
                LIFESPAN_MILLIS,
                () => Point.ZERO,
                Math.random() > 0.5 ? new Point(2, 2) : new Point(1, 1)
            )
        }

        this.timeUntilNextEmission = MILLIS_BETWEEN_EMISSIONS
    }
}
