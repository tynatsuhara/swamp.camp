import { Component } from "brigsby/dist/Component"
import { UpdateData } from "brigsby/dist/Engine"
import { Point } from "brigsby/dist/Point"
import { RenderMethod } from "brigsby/dist/renderer/RenderMethod"
import { SpriteTransform } from "brigsby/dist/sprites/SpriteTransform"
import { StaticSpriteSource } from "brigsby/dist/sprites/StaticSpriteSource"
import { controls } from "../Controls"
import { getImage, TILE_SIZE } from "../graphics/Tilesets"
import { Mouse } from "./Mouse"

export class Cursor extends Component {
    private readonly cursorSprite = new StaticSpriteSource(
        getImage("cursor.png"),
        Point.ZERO,
        new Point(TILE_SIZE, TILE_SIZE)
    )

    private cursorRenderMethod: RenderMethod

    constructor(shouldShow: () => boolean = () => true) {
        super()

        this.update = (updateData: UpdateData) => {
            this.cursorRenderMethod = undefined
            if (controls.isGamepadMode()) {
                if (shouldShow()) {
                    this.cursorRenderMethod = this.cursorSprite.toImageRender(
                        SpriteTransform.new({
                            position: controls.getMousePos(),
                            depth: Number.MAX_SAFE_INTEGER,
                        })
                    )
                }
                Mouse.hide()
            } else {
                Mouse.show()
            }
        }
    }

    getRenderMethods(): RenderMethod[] {
        if (this.cursorRenderMethod) {
            return [this.cursorRenderMethod]
        }
        return []
    }
}
