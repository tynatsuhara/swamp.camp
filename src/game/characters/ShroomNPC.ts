import { Component } from "../../engine/component"
import { Dude } from "./Dude"
import { UpdateData } from "../../engine/engine"
import { InputKey } from "../../engine/input"
import { Enemy } from "./Enemy"

const SIZE = "s"  // one of [1, 2, 3]

export class ShroomNPC extends Component {
    
    private dude: Dude
    private enemy: Enemy

    awake() {
        this.dude = this.entity.getComponent(Dude)
        this.dude.weapon.setDelayBetweenAttacks(500)
        this.dude.blob[SIZE] = this.dude.blob[SIZE] || 1
    }

    update(data: UpdateData) {
        if (data.input.isKeyDown(InputKey.M)) {
            this.dude.blob[SIZE] = Math.min(this.dude.blob[SIZE] + 1, 3)
            this.updateSize()
        }
    }

    private updateSize() {
        if (ShroomNPC.isAggro(this.dude) && !this.enemy) {
            this.enemy = this.entity.addComponent(new Enemy())
        }
    }

    static isAggro(shroom: Dude) {
        return shroom.blob[SIZE] === 3
    }
}