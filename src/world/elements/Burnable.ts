import { Component } from "brigsby/dist/Component"
import { ElementComponent } from "./ElementComponent"

export class Burnable extends Component {
    private element: ElementComponent

    // constructor(burning: boolean, tilePt: Point) {
    //     super()
    // }

    start() {
        this.element = this.entity.getComponent(ElementComponent)
    }

    burn() {
        console.warn("burning!")
    }
}
