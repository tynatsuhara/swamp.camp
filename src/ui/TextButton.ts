import { Component, Point } from "brigsby/dist"
import { ImageRender, TextRender } from "brigsby/dist/renderer"
import { SpriteTransform } from "brigsby/dist/sprites"
import { Maths } from "brigsby/dist/util"
import { controls } from "../core/Controls"
import { TILE_SIZE, Tilesets } from "../graphics/Tilesets"
import { ClickableUI } from "./ClickableUI"
import { TEXT_FONT, TEXT_PIXEL_WIDTH, TEXT_SIZE } from "./Text"
import { UISounds } from "./UISounds"
import { UI_SPRITE_DEPTH } from "./UiConstants"

export class TextButton extends Component {
    static readonly margin = 6
    private static readonly textOffset = new Point(TextButton.margin, TextButton.margin - 2)

    private readonly position: Point
    private readonly text: string
    readonly width: number

    private left: ImageRender
    private center: ImageRender
    private right: ImageRender
    private onClick: () => void
    private onMouseOver: () => void
    private onMouseOut: () => void
    private hovering: boolean
    private textColor: string
    private hoverColor: string

    constructor({
        index,
        key,
        position,
        text,
        onClick,
        onMouseOver,
        onMouseOut,
        buttonColor,
        textColor,
        hoverColor,
    }: {
        index: number
        key: string
        position: Point
        text: string
        onClick: () => void
        onMouseOver: () => void
        onMouseOut: () => void
        buttonColor: "red" | "white"
        textColor: string
        hoverColor: string
    }) {
        super()
        this.position = position
        this.text = text
        this.onClick = onClick
        this.onMouseOver = onMouseOver
        this.onMouseOut = onMouseOut
        this.textColor = textColor
        this.hoverColor = hoverColor
        this.width = this.text.length * TEXT_PIXEL_WIDTH + TextButton.margin * 2

        this.awake = () => {
            const leftPos = this.position.apply(Math.floor)
            const centerPos = leftPos.plus(new Point(TILE_SIZE, 0))
            const rightPos = leftPos.plus(new Point(this.width - TILE_SIZE, 0)).apply(Math.floor)

            const cursorLockPos = leftPos.plusX(this.width / 2).plusY(2)
            this.entity.addComponent(new ClickableUI(key, cursorLockPos, index === 0))

            this.left = Tilesets.instance.oneBit
                .getTileSource(`btnLeft_${buttonColor}`)
                .toImageRender(new SpriteTransform(leftPos))
            this.center = Tilesets.instance.oneBit
                .getTileSource(`btnCenter_${buttonColor}`)
                .toImageRender(
                    new SpriteTransform(
                        centerPos,
                        new Point(this.width + TextButton.margin * 2 - TILE_SIZE * 2, TILE_SIZE)
                    )
                )
            this.right = Tilesets.instance.oneBit
                .getTileSource(`btnRight_${buttonColor}`)
                .toImageRender(new SpriteTransform(rightPos))

            Array.from([this.left, this.center, this.right]).forEach(
                (t) => (t.depth = UI_SPRITE_DEPTH + 1)
            )
        }
    }

    update() {
        const wasHovering = this.hovering
        this.hovering = Maths.rectContains(
            this.position,
            new Point(this.width, TILE_SIZE),
            controls.getCursorPos()
        )
        if (this.hovering && !wasHovering) {
            this.onMouseOver?.()
        } else if (!this.hovering && wasHovering) {
            this.onMouseOut?.()
        }
        if (this.hovering && controls.isMenuClickDown()) {
            UISounds.playClickSound()
            this.onClick()
        }
    }

    getRenderMethods() {
        if (this.text === null) {
            return []
        }
        return [
            new TextRender(
                this.text,
                this.left.position.plus(TextButton.textOffset),
                TEXT_SIZE,
                TEXT_FONT,
                this.hovering ? this.hoverColor : this.textColor,
                UI_SPRITE_DEPTH + 2
            ),
            this.left,
            this.center,
            this.right,
        ]
    }
}
