import { Component } from "../../engine/Component"
import { RenderMethod } from "../../engine/renderer/RenderMethod"
import { Tilesets } from "../graphics/Tilesets"
import { TileTransform } from "../../engine/tiles/TileTransform"
import { Point } from "../../engine/Point"
import { TextRender } from "../../engine/renderer/TextRender"
import { InputKey } from "../../engine/Input"
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
                new TileTransform(this.pos, null, 0, false, false, UIStateManager.UI_SPRITE_DEPTH)
            ),
            new TextRender(
                Controls.keyString(this.key).toLowerCase(), 
                this.pos.plus(new Point(4, 4)), 
                TEXT_SIZE, TEXT_FONT, 
                Color.BLACK, 
                UIStateManager.UI_SPRITE_DEPTH
            )
        ]
    }
}