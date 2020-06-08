import { Component } from "../../../engine/component";
import { Point } from "../../../engine/point"
import { KeyPressIndicator } from "../../ui/KeyPressIndicator"
import { RenderMethod } from "../../../engine/renderer/RenderMethod"
import { Controls } from "../../Controls"
import { TILE_SIZE } from "../../graphics/Tilesets"

export class Interactable extends Component {

    position: Point
    uiOffset: Point
    private canInteract: boolean
    get isShowingUI() { return this.canInteract }

    constructor(position: Point, fn: () => void, uiOffset: Point = Point.ZERO) {
        super()
        this.position = position
        this.interact = fn
        this.uiOffset = uiOffset
    }

    updateIndicator(canInteract: boolean) {
        this.canInteract = canInteract
    }

    interact() {}

    getRenderMethods(): RenderMethod[] {
        if (!this.canInteract) {
            return []
        }
        return new KeyPressIndicator(
            this.position.minus(new Point(TILE_SIZE/2, TILE_SIZE/2)).plus(this.uiOffset), 
            Controls.interactButton
        ).getRenderMethods()
    }
}