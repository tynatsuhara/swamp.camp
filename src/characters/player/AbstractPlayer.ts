import { Component } from "brigsby/dist"
import { controls } from "../../Controls"
import { Camera } from "../../cutscenes/Camera"
import { Dude } from "../Dude"
import { registerPlayerInstance } from "./index"

export abstract class AbstractPlayer extends Component {
    private _dude: Dude
    get dude() {
        return this._dude
    }

    constructor() {
        super()
        registerPlayerInstance(this)
    }

    awake() {
        this._dude = this.entity.getComponent(Dude)
        this.dude.setOnDamageCallback((blocked) => {
            // TODO: Add controller vibration if possible
            if (!this.dude.isAlive) {
                Camera.instance.shake(6, 600)
            } else if (blocked) {
                Camera.instance.shake(2.5, 400)
            } else {
                Camera.instance.shake(3.5, 400)
            }
            controls.vibrate({
                duration: 300,
                strongMagnitude: 0.5,
                weakMagnitude: 0.5,
            })
        })
    }
}
