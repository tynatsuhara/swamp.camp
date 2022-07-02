import { Component } from "brigsby/dist"
import { Dude } from "../Dude"

/**
 * A basic component which can be added by DudeFactory to modify a dude after they are instantiated
 */
export class DudeModifier extends Component {
    constructor(fn: (dude: Dude) => void) {
        super()
        this.awake = () => {
            const dude = this.entity.getComponent(Dude)
            fn(dude)
        }
    }
}
