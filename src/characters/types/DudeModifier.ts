import { Component } from "brigsby/dist"
import { Dude } from "../Dude"

/**
 * A basic component which can be added by DudeFactory to modify a dude after they are instantiated
 */
export class DudeModifier extends Component {
    constructor(private readonly fn: (dude: Dude) => void) {
        super()
    }

    awake() {
        const dude = this.entity.getComponent(Dude)
        this.fn(dude)
    }
}
