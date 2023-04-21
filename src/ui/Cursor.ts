import { Component, Point, UpdateData } from "brigsby/dist"
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

    update({ view, elapsedTimeMillis, input }: UpdateData): void {
        ClickableUI.update(view)

        const cursorShouldBeVisible =
            !ClickableUI.hideCursor && (!controls.isGamepadMode() || this.shouldShowInGamepadMode())

        if (controls.isGamepadMode()) {
            controls.updateGamepadCursorPosition(elapsedTimeMillis)
        }
        this.cursorRenderMethod = undefined

        if (cursorShouldBeVisible) {
            const useRenderOnKbm =
                !controls.isGamepadMode() &&
                ClickableUI.isActive &&
                !controls.getCursorPos().equals(input.mousePos)
            const useRenderOnGamepad = controls.isGamepadMode()
            if (useRenderOnGamepad || useRenderOnKbm) {
                this.cursorRenderMethod = this.cursorSprite.toImageRender(
                    SpriteTransform.new({
                        position: controls.getCursorPos(),
                        depth: Number.MAX_SAFE_INTEGER,
                    })
                )
                Mouse.hide()
            } else {
                controls.setGamepadCursorPosition(input.mousePos)
                requestAnimationFrame(() => Mouse.show())
            }
        } else {
            Mouse.hide()
        }
    }

    getRenderMethods(): RenderMethod[] {
        if (this.cursorRenderMethod) {
            return [this.cursorRenderMethod]
        }
        return []
    }
}
