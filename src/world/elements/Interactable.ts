import { Component, debug, GamepadButton, InputKey, Point } from "brigsby/dist"
import { EllipseRender, RenderMethod } from "brigsby/dist/renderer"
import { Dude } from "../../characters/Dude"
import { player } from "../../characters/player/index"
import { controls } from "../../Controls"
import { TILE_SIZE } from "../../graphics/Tilesets"
import { ButtonIndicator } from "../../ui/ButtonIndicator"
import { KeyPressIndicator } from "../../ui/KeyPressIndicator"
import { UIStateManager } from "../../ui/UIStateManager"

export class Interactable extends Component {
    position: Point
    private readonly fn: (interactor: Dude) => void
    uiOffset: Point
    private showUI: boolean
    get isShowingUI() {
        return this.showUI
    }

    // This will be evaluated on both host AND client
    readonly isInteractable: (interactor: Dude) => boolean

    constructor(
        position: Point,
        fn: (interactor: Dude) => void,
        uiOffset: Point = Point.ZERO,
        isInteractable: (interactor: Dude) => boolean = () => true
    ) {
        super()
        this.position = position
        this.fn = fn
        this.uiOffset = uiOffset
        this.isInteractable = (interactor: Dude) => {
            const isNotLocalPlayer = interactor !== player()
            const canInteractorInteract = isNotLocalPlayer || !UIStateManager.instance.isMenuOpen
            return canInteractorInteract && isInteractable(interactor)
        }
    }

    updateIndicator(showUI: boolean) {
        this.showUI = showUI
    }

    // Host AND client can both call this!
    interact(interactor: Dude) {
        this.fn(interactor)
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
            .apply(Math.round)

        if (controls.isGamepadMode()) {
            return new ButtonIndicator(indicatorPos, GamepadButton.X).getRenderMethods()
        } else {
            return new KeyPressIndicator(indicatorPos, InputKey.E).getRenderMethods()
        }
    }
}
