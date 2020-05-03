import { Component } from "../../../engine/component";
import { Point } from "../../../engine/point"

export class Interactable extends Component {

    position: Point

    constructor(position: Point, fn: () => void) {
        super()
        this.position = position
        this.interact = fn
    }

    interact() {}
}