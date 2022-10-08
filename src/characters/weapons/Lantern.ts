import { Point } from "brigsby/dist"
import { TILE_SIZE } from "../../graphics/Tilesets"
import { LightManager } from "../../world/LightManager"
import { here } from "../../world/locations/LocationManager"
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
        const dims = this.dude.animation.transform.dimensions
        this.transform.position = new Point(dims.x / 2, dims.y)
            .plus(this.dude.getOffsetRelativeToAnimation())
            .minus(new Point(0, 16))

        this.transform.depth = -0.5

        LightManager.instance.addLight(
            here(),
            this,
            this.dude.standingPosition.plusY(-TILE_SIZE / 2).plus(this.dude.getAnimationOffset()),
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
