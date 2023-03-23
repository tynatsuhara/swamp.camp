import { Component, GamepadButton, Point } from "brigsby/dist"
import { RenderMethod } from "brigsby/dist/renderer"
import { SpriteTransform } from "brigsby/dist/sprites"
import { Tilesets } from "../graphics/Tilesets"
import { UI_SPRITE_DEPTH } from "./UiConstants"

export class ButtonIndicator extends Component {
    constructor(
        private readonly pos: Point,
        private readonly button: GamepadButton,
        private readonly depth = UI_SPRITE_DEPTH
    ) {
        super()
    }

    getRenderMethods(): RenderMethod[] {
        return [
            Tilesets.instance.oneBit
                .getTileSource(this.getTileKey())
                .toImageRender(SpriteTransform.new({ position: this.pos, depth: this.depth })),
        ]
    }

    private getTileKey(): string {
        switch (this.button) {
            case GamepadButton.TRIANGLE:
                return "gamepad-triangle"
            case GamepadButton.CIRCLE:
                return "gamepad-circle"
            case GamepadButton.X:
                return "gamepad-x"
            case GamepadButton.SQUARE:
                return "gamepad-square"

            case GamepadButton.UP:
                return "gamepad-up"
            case GamepadButton.RIGHT:
                return "gamepad-right"
            case GamepadButton.DOWN:
                return "gamepad-down"
            case GamepadButton.LEFT:
                return "gamepad-left"
        }
    }
}
