import { Point } from "brigsby/dist/Point"
import { FireParticles } from "../../graphics/FireParticles"
import { TILE_SIZE } from "../../graphics/Tilesets"
import { LightManager } from "../../world/LightManager"
import { LocationManager } from "../../world/LocationManager"
import { TimeUnit } from "../../world/TimeUnit"
import { WorldTime } from "../../world/WorldTime"
import { Shield } from "./Shield"
import { ShieldType } from "./ShieldType"

const BLOB_ATTRIBUTE = "torch-start"
const LIFESPAN_MILLIS = TimeUnit.MINUTE * 30
const DIAMETERS = [40, 60, 80]

/**
 * A torch, which is a short-lived lantern that can be used to burn shit
 */
export class Torch extends Shield {
    private particles: FireParticles

    constructor() {
        super(ShieldType.TORCH, "tool_torch")
    }

    start() {
        if (!this.dude.blob[BLOB_ATTRIBUTE]) {
            this.dude.blob[BLOB_ATTRIBUTE] = WorldTime.instance.time
        }

        this.particles = this.entity.addComponent(
            new FireParticles(
                3,
                () => this.transform.position.plus(new Point(2, 4)),
                () => this.transform.depth + 0.1
            )
        )
    }

    update() {
        this.transform.position = this.getPosition()
        this.transform.depth = -0.5

        const now = WorldTime.instance.time
        const fireStart = this.dude.blob[BLOB_ATTRIBUTE]

        if (now > fireStart + LIFESPAN_MILLIS) {
            this.delete()
            return
        }

        const size =
            DIAMETERS.length - Math.floor((DIAMETERS.length * (now - fireStart)) / LIFESPAN_MILLIS)
        this.particles.size = size
        const diameter = DIAMETERS[size - 1]

        LightManager.instance.addLight(
            LocationManager.instance.currentLocation,
            this,
            this.dude.standingPosition
                .plusY(-TILE_SIZE / 2)
                .plus(this.dude.getAnimationOffsetPosition()),
            diameter
        )
    }

    delete() {
        this.dude.blob[BLOB_ATTRIBUTE] = undefined
        this.particles.delete()
        this.removeLight()
        super.delete()
    }

    removeLight() {
        LightManager.instance.removeLight(LocationManager.instance.currentLocation, this)
    }

    toggleOnBack() {}

    block() {}

    isBlocking() {
        return false
    }

    canAttack() {
        return true
    }

    private getPosition() {
        return this.dude.animation.transform.dimensions
            .plus(this.dude.getAnimationOffsetPosition())
            .minus(new Point(4, 18))
    }
}
