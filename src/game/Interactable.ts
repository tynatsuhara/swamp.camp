import { Component } from "../engine/component";

export class Interactable extends Component {

    constructor(fn: () => void) {
        super()
        this.interact = fn
    }

    interact() {}
}