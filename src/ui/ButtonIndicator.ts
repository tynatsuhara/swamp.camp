import { Component } from "brigsby/dist/Component"
import { GamepadButton } from "brigsby/dist/Input"
import { Point } from "brigsby/dist/Point"
import { RenderMethod } from "brigsby/dist/renderer/RenderMethod"
import { SpriteTransform } from "brigsby/dist/sprites/SpriteTransform"
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
                .getTileAt(this.getTile())
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

    private getTile(): Point {
        switch (this.button) {
            case GamepadButton.X:
                return new Point(30, 25)
        }
    }
}
