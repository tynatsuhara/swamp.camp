import { Component, InputKey, InputKeyString, Point } from "brigsby/dist"
import { RenderMethod, TextRender } from "brigsby/dist/renderer"
import { SpriteTransform } from "brigsby/dist/sprites"
import { Tilesets } from "../graphics/Tilesets"
import { Color } from "./Color"
import { TEXT_FONT, TEXT_SIZE } from "./Text"
import { UI_SPRITE_DEPTH } from "./UiConstants"

export class KeyPressIndicator extends Component {
    constructor(private readonly pos: Point, private readonly key: InputKey) {
        super()
    }

    getRenderMethods(): RenderMethod[] {
        return [
            Tilesets.instance.oneBit
                .getTileSource("keycap")
                .toImageRender(
                    new SpriteTransform(this.pos, null, 0, false, false, UI_SPRITE_DEPTH)
                ),
            new TextRender(
                InputKeyString.for(this.key).toLowerCase(),
                this.pos.plus(new Point(4, 4)),
                TEXT_SIZE,
                TEXT_FONT,
                Color.BLACK,
                UI_SPRITE_DEPTH
            ),
        ]
    }
}
