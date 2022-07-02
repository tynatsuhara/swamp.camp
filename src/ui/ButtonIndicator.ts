import { Component, GamepadButton, Point } from "brigsby/dist"
import { RenderMethod } from "brigsby/dist/renderer"
import { SpriteTransform } from "brigsby/dist/sprites"
import { Tilesets } from "../graphics/Tilesets"
import { UIStateManager } from "./UIStateManager"

export class ButtonIndicator extends Component {
    private readonly pos: Point
    private readonly button: GamepadButton

    constructor(pos: Point, button: GamepadButton) {
        super()
        this.pos = pos
        this.button = button
    }

    getRenderMethods(): RenderMethod[] {
        return [
            Tilesets.instance.oneBit
                .getTileSource(this.getTileKey())
                .toImageRender(
                    new SpriteTransform(
                        this.pos,
                        null,
                        0,
                        false,
                        false,
                        UIStateManager.UI_SPRITE_DEPTH
                    )
                ),
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
