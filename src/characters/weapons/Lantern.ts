import { Point } from "brigsby/dist/Point"
import { TILE_SIZE } from "../../graphics/Tilesets"
import { LightManager } from "../../world/LightManager"
import { LocationManager } from "../../world/LocationManager"
import { Shield } from "./Shield"
import { ShieldType } from "./ShieldType"

/**
 * A lantern, which is really just a shield that can't block and emits light
 */
export class Lantern extends Shield {
    static readonly DIAMETER = 100

    constructor() {
        super(ShieldType.LANTERN, "tool_lantern")
    }

    update() {
        this.transform.position = this.dude.animation.transform.dimensions
            .plus(this.dude.getAnimationOffsetPosition())
            .minus(new Point(8, 16))

        this.transform.depth = -0.5

        LightManager.instance.addLight(
            LocationManager.instance.currentLocation,
            this,
            this.dude.standingPosition
                .plusY(-TILE_SIZE / 2)
                .plus(this.dude.getAnimationOffsetPosition()),
            Lantern.DIAMETER
        )
    }

    delete() {
        this.removeLight()
        super.delete()
    }

    removeLight() {
        LightManager.instance.removeLight(this)
    }

    toggleOnBack() {}

    block() {}

    isBlocking() {
        return false
    }

    canAttack() {
        return true
    }
}
