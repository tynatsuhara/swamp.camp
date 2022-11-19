import { Component, GamepadButton, Point } from "brigsby/dist"
import { RenderMethod } from "brigsby/dist/renderer"
import { SpriteTransform } from "brigsby/dist/sprites"
import { Tilesets } from "../graphics/Tilesets"
import { UIStateManager } from "./UIStateManager"

export class ButtonIndicator extends Component {
    private readonly pos: Point
    private readonly button: GamepadButton
    private readonly depth: number

    constructor(pos: Point, button: GamepadButton, depth = UIStateManager.UI_SPRITE_DEPTH) {
        super()
        this.pos = pos
        this.button = button
        this.depth = depth
    }

    getRenderMethods(): RenderMethod[] {
        return [
            Tilesets.instance.oneBit
                .getTileSource(this.getTileKey())
                .toImageRender(new SpriteTransform(this.pos, null, 0, false, false, this.depth)),
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
