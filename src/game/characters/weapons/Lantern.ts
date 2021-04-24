import { Point } from "../../../engine/point"
import { TILE_SIZE } from "../../graphics/Tilesets"
import { LocationManager } from "../../world/LocationManager"
import { OutdoorDarknessMask } from "../../world/OutdoorDarknessMask"
import { Shield } from "./Shield"
import { ShieldType } from "./ShieldType"

/**
 * A lantern, which is really just a shield that can't block and emits light
 */
export class Lantern extends Shield {

    constructor() {
        super(ShieldType.LANTERN, "tool_lantern")
    }

    update() {
        this.transform.position = this.dude.animation.transform.dimensions
                .plus(this.dude.getAnimationOffsetPosition())
                .minus(new Point(8, 16))

        this.transform.depth = -.5

        OutdoorDarknessMask.instance.addLight(
            LocationManager.instance.currentLocation, 
            this, 
            this.dude.standingPosition.plusY(-TILE_SIZE/2).plus(this.dude.getAnimationOffsetPosition()), 
            100
        )
    }

    delete() {
        OutdoorDarknessMask.instance.removeLight(LocationManager.instance.currentLocation, this)
        super.delete()
    }

    toggleOnBack() {}

    block(blockingActive: boolean) {}

    isBlocking() {
        return false
    }

    canAttack() {
        return true
    }
}