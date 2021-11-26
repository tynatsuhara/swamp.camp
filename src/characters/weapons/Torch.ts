import { Point } from "brigsby/dist/Point"
import { FireParticles } from "../../graphics/FireParticles"
import { TILE_SIZE } from "../../graphics/Tilesets"
import { LightManager } from "../../world/LightManager"
import { LocationManager } from "../../world/LocationManager"
import { Shield } from "./Shield"
import { ShieldType } from "./ShieldType"

/**
 * A torch, which is a short-lived lantern that can be used to burn shit
 */
export class Torch extends Shield {
    static readonly DIAMETER = 100 // TODO add lifespan

    private particles: FireParticles

    constructor() {
        super(ShieldType.TORCH, "tool_torch")
    }

    start() {
        this.update() // set up the light
        this.particles = this.entity.addComponent(
            new FireParticles(
                3,
                () => this.getPosition().plus(this.transform.position).minus(new Point(9, 6)),
                () => this.transform.depth + 0.1
            )
        )
    }

    update() {
        this.transform.position = this.getPosition()

        this.transform.depth = -0.5

        LightManager.instance.addLight(
            LocationManager.instance.currentLocation,
            this,
            this.dude.standingPosition
                .plusY(-TILE_SIZE / 2)
                .plus(this.dude.getAnimationOffsetPosition()),
            Torch.DIAMETER
        )
    }

    delete() {
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
