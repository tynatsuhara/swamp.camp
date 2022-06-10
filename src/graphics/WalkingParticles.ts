import { Component } from "brigsby/dist/Component"
import { debug } from "brigsby/dist/Debug"
import { UpdateData } from "brigsby/dist/Engine"
import { Point } from "brigsby/dist/Point"
import { Dude } from "../characters/Dude"
import { Color } from "../ui/Color"
import { Ground } from "../world/ground/Ground"
import { GroundRenderer } from "../world/GroundRenderer"
import { here } from "../world/LocationManager"
import { WorldTime } from "../world/WorldTime"
import { Particles } from "./Particles"

const MILLIS_BETWEEN_EMISSIONS = 50
const LIFESPAN_MILLIS = 300
const BLOOD_PROBABILITY = 0.25

export class WalkingParticles extends Component {
    private dude: Dude
    private timeUntilNextEmission = 0

    awake() {
        this.dude = this.entity.getComponent(Dude)
    }

    land() {
        const groud = here().getGround(this.dude.tile)

        if (Ground.isWater(groud?.type)) {
            const particles = 10 + Math.random() * 5
            for (let i = 0; i < particles; i++) {
                const moveTimeLimit = 100 + Math.random() * 200
                const lifeSpan = moveTimeLimit * 2
                const depth = this.dude.standingPosition.y + 6
                const offset = Point.ZERO.randomCircularShift(1)

                Particles.instance.emitParticle(
                    Color.WHITE,
                    this.dude.standingPosition.plus(offset).plusY(-7),
                    depth + 1,
                    lifeSpan,
                    (t) => offset.times(Math.min(moveTimeLimit, t) * 0.035),
                    Math.random() > 0.5 ? new Point(2, 2) : new Point(1, 1)
                )
            }
        } else {
            const particles = 10 + Math.random() * 5
            for (let i = 0; i < particles; i++) {
                const moveTimeLimit = 100 + Math.random() * 200
                const lifeSpan = moveTimeLimit * 2

                const offset = Point.ZERO.randomCircularShift(1)

                Particles.instance.emitParticle(
                    Color.TAUPE_5,
                    this.dude.standingPosition.plus(offset),
                    GroundRenderer.DEPTH + 1,
                    lifeSpan,
                    (t) => offset.times(Math.min(moveTimeLimit, t) * 0.035),
                    Math.random() > 0.5 ? new Point(2, 2) : new Point(1, 1)
                )
            }
        }
    }

    update(updateData: UpdateData) {
        const groud = here().getGround(this.dude.tile)
        const isInWater = Ground.isWater(groud?.type)

        // TODO blood
        if (
            debug.enableBlood &&
            this.dude.health < this.dude.maxHealth &&
            this.dude.lastAttackerTime > WorldTime.instance.time - 10_000 &&
            Math.random() > this.dude.health / this.dude.maxHealth &&
            Math.random() < BLOOD_PROBABILITY
        ) {
            let duration = 10_000 + Math.random() * 10_000
            let depth = GroundRenderer.DEPTH + 1

            if (isInWater) {
                duration *= 0.08
                depth = this.dude.standingPosition.y + 7
            }

            Particles.instance.emitParticle(
                Math.random() > 0.9 ? Color.RED_3 : Color.RED_2,
                this.dude.standingPosition.randomCircularShift(4 * (this.dude.isAlive ? 1 : 2)),
                depth,
                duration,
                () => Point.ZERO,
                Math.random() > 0.5 ? new Point(2, 2) : new Point(1, 1)
            )
        }

        const doNotShowParticles = this.dude.jumping || here().isInterior

        if (doNotShowParticles) {
            // set to 0 so that particles will be emitted immediately once it makes sense
            this.timeUntilNextEmission = 0
            return
        }

        this.timeUntilNextEmission -= updateData.elapsedTimeMillis
        if (this.timeUntilNextEmission > 0) {
            return
        }

        if (isInWater) {
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
