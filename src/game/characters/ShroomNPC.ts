import { Component } from "../../engine/component"
import { Dude } from "./Dude"
import { UpdateData } from "../../engine/engine"
import { InputKey } from "../../engine/input"
import { Enemy } from "./Enemy"
import { DudeFactory } from "./DudeFactory"
import { LocationManager } from "../world/LocationManager"

const SIZE = "s"  // one of [1, 2, 3]

export class ShroomNPC extends Component {
    
    private dude: Dude

    awake() {
        this.dude = this.entity.getComponent(Dude)
        this.dude.weapon.setDelayBetweenAttacks(500)
        this.dude.blob[SIZE] = this.dude.blob[SIZE] || 1
        if (ShroomNPC.isAggro(this.dude)) {
            this.entity.addComponent(new Enemy())
        }
    }

    update(data: UpdateData) {
        if (data.input.isKeyDown(InputKey.J)) {
            this.dude.blob[SIZE] = Math.min(this.dude.blob[SIZE] + 1, 3)

            // overwrite the animation
            const data = this.dude.save()
            data.anim = ShroomNPC.getAnimationName(this.dude.blob)

            // delete and respawn the shroom dude
            this.entity.selfDestruct()
            DudeFactory.instance.load(data, LocationManager.instance.exterior())
        }
    }

    static isAggro(shroom: Dude) {
        return shroom.blob[SIZE] === 3
    }

    static getAnimationName(blob: object) {
        const size = blob[SIZE] || 1
        return [
            "SmallMushroom",
            "NormalMushroom",
            "LargeMushroom",
        ][size-1]
    }
}