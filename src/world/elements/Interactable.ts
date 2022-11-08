import { Component, debug, GamepadButton, InputKey, Point } from "brigsby/dist"
import { EllipseRender, RenderMethod } from "brigsby/dist/renderer"
import { controls } from "../../Controls"
import { TILE_SIZE } from "../../graphics/Tilesets"
import { session } from "../../online/session"
import { ButtonIndicator } from "../../ui/ButtonIndicator"
import { KeyPressIndicator } from "../../ui/KeyPressIndicator"
import { UIStateManager } from "../../ui/UIStateManager"

export class Interactable extends Component {
    position: Point
    private readonly fn: () => void
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
        isInteractable: () => boolean = () => true
    ) {
        super()
        this.position = position
        this.fn = fn
        this.uiOffset = uiOffset
        this.isInteractable = () => {
            // TODO: Certain things might be interactable for guests, move this logic up
            return !UIStateManager.instance.isMenuOpen && isInteractable()
        }
    }

    updateIndicator(showUI: boolean) {
        this.showUI = showUI
    }

    interact() {
        if (session.isHost()) {
            this.fn()
        }
    }

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

        const indicatorPos = this.position
            .minus(new Point(TILE_SIZE / 2, TILE_SIZE / 2))
            .plus(this.uiOffset)

        if (controls.isGamepadMode()) {
            return new ButtonIndicator(indicatorPos, GamepadButton.X).getRenderMethods()
        } else {
            return new KeyPressIndicator(indicatorPos, InputKey.E).getRenderMethods()
        }
    }
}
