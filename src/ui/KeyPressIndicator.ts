import { Component } from "brigsby/dist/Component"
import { RenderMethod } from "brigsby/dist/renderer/RenderMethod"
import { Tilesets } from "../graphics/Tilesets"
import { SpriteTransform } from "brigsby/dist/sprites/SpriteTransform"
import { Point } from "brigsby/dist/Point"
import { TextRender } from "brigsby/dist/renderer/TextRender"
import { InputKey, InputKeyString } from "brigsby/dist/Input"
import { Controls } from "../Controls"
import { TEXT_SIZE, TEXT_FONT } from "./Text"
import { UIStateManager } from "./UIStateManager"
import { Color } from "./Color"

export class KeyPressIndicator extends Component {

    private readonly pos: Point
    private readonly key: InputKey

    constructor(pos: Point, key: InputKey) {
        super()
        this.pos = pos
        this.key = key
    }

    getRenderMethods(): RenderMethod[] {
        return [
            Tilesets.instance.oneBit.getTileSource("keycap").toImageRender(
                new SpriteTransform(this.pos, null, 0, false, false, UIStateManager.UI_SPRITE_DEPTH)
            ),
            new TextRender(
                InputKeyString.for(this.key).toLowerCase(), 
                this.pos.plus(new Point(4, 4)), 
                TEXT_SIZE, TEXT_FONT, 
                Color.BLACK, 
                UIStateManager.UI_SPRITE_DEPTH
            )
        ]
    }
}