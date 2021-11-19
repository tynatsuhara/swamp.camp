import { Component } from "brigsby/dist/Component"
import { debug } from "brigsby/dist/Debug"
import { Point } from "brigsby/dist/Point"
import { EllipseRender } from "brigsby/dist/renderer/EllipseRender"
import { RenderMethod } from "brigsby/dist/renderer/RenderMethod"
import { Controls } from "../../Controls"
import { TILE_SIZE } from "../../graphics/Tilesets"
import { KeyPressIndicator } from "../../ui/KeyPressIndicator"
import { UIStateManager } from "../../ui/UIStateManager"

export class Interactable extends Component {
    position: Point
    uiOffset: Point
    private showUI: boolean
    get isShowingUI() {
        return this.showUI
    }
    readonly isInteractable: () => boolean

    constructor(
        position: Point,
        fn: () => void,
        uiOffset: Point = Point.ZERO,
        isInteractable: () => boolean = () => !UIStateManager.instance.isMenuOpen
    ) {
        super()
        this.position = position
        this.interact = fn
        this.uiOffset = uiOffset
        this.isInteractable = isInteractable
    }

    updateIndicator(showUI: boolean) {
        this.showUI = showUI
    }

    interact() {}

    getRenderMethods(): RenderMethod[] {
        if (!this.showUI) {
            if (debug.showInteractables) {
                return [
                    new EllipseRender({
                        depth: Number.MAX_SAFE_INTEGER,
                        position: this.position.plus(new Point(-2, -2)),
                        dimensions: new Point(4, 4),
                    }),
                ]
            }
            return []
        }
        return new KeyPressIndicator(
            this.position.minus(new Point(TILE_SIZE / 2, TILE_SIZE / 2)).plus(this.uiOffset),
            Controls.interactButton
        ).getRenderMethods()
    }
}
