import { Component, Point } from "brigsby/dist"
import { RenderMethod } from "brigsby/dist/renderer"
import { SpriteTransform, StaticSpriteSource } from "brigsby/dist/sprites"
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

        this.update = ({ elapsedTimeMillis }) => {
            this.cursorRenderMethod = undefined
            if (controls.isGamepadMode()) {
                if (shouldShow()) {
                    controls.updateGamepadCursorPosition(elapsedTimeMillis)

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
