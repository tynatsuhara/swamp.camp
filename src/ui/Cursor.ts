import { Component, debug, Point, UpdateData } from "brigsby/dist"
import { RenderMethod } from "brigsby/dist/renderer"
import { SpriteTransform, StaticSpriteSource } from "brigsby/dist/sprites"
import { controls } from "../Controls"
import { getImage, TILE_SIZE } from "../graphics/Tilesets"
import { ClickableUI } from "./ClickableUI"
import { Mouse } from "./Mouse"

export class Cursor extends Component {
    private readonly cursorSprite = new StaticSpriteSource(
        getImage("cursor.png"),
        Point.ZERO,
        new Point(TILE_SIZE, TILE_SIZE)
    )

    private cursorRenderMethod: RenderMethod

    constructor(private readonly shouldShowInGamepadMode: () => boolean = () => true) {
        super()
    }

    update({ view, elapsedTimeMillis }: UpdateData): void {
        ClickableUI.update(view)

        this.cursorRenderMethod = undefined

        const cursorShouldBeVisible = !debug.dpadMenus || !ClickableUI.isLockedOn

        if (controls.isGamepadMode()) {
            if (this.shouldShowInGamepadMode() && cursorShouldBeVisible) {
                controls.updateGamepadCursorPosition(elapsedTimeMillis)

                this.cursorRenderMethod = this.cursorSprite.toImageRender(
                    SpriteTransform.new({
                        position: controls.getMousePos(),
                        depth: Number.MAX_SAFE_INTEGER,
                    })
                )
            }
            // use the cursor render method instead of the native mouse
            Mouse.hide()
        } else {
            if (cursorShouldBeVisible) {
                Mouse.show()
            } else {
                Mouse.hide()
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
