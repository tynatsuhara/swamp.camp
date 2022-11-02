import { Component, Point } from "brigsby/dist"
import { TextRender } from "brigsby/dist/renderer"
import { Maths } from "brigsby/dist/util"
import { controls } from "../Controls"
import { TILE_SIZE } from "../graphics/Tilesets"
import { Color } from "./Color"
import { TEXT_FONT, TEXT_PIXEL_WIDTH, TEXT_SIZE } from "./Text"
import { UISounds } from "./UISounds"
import { UIStateManager } from "./UIStateManager"

export class MainMenuButton extends Component {
    private readonly width: number = 500

    private readonly position: Point
    private readonly text: string
    private readonly onClick: () => void
    private readonly onHover: () => void
    private readonly hoverable: boolean
    private hovering: boolean = false

    constructor(
        position: Point,
        text: string,
        onClick: () => void,
        onHover: () => void,
        hoverable: boolean
    ) {
        super()
        this.position = position.apply(Math.floor)
        this.text = text
        this.onClick = onClick
        this.onHover = onHover
        this.hoverable = hoverable
    }

    update() {
        this.hovering =
            this.hoverable &&
            Maths.rectContains(
                this.position.plusX(-this.width / 2).plusY(-4),
                new Point(this.width, TILE_SIZE),
                controls.getMousePos()
            )

        if (this.hovering) {
            this.onHover()
        }

        if (this.hovering && controls.isMenuClickDown()) {
            // Use a promise to ensure the sound starts playing before executing onClick
            UISounds.playClickSound().then(() => this.onClick())
        }
    }

    getRenderMethods() {
        if (this.text === null) {
            return []
        }

        let text = this.text

        // if manually aligning whitespace, put "> " after leading spaces
        if (this.text.startsWith("  ")) {
            if (this.hovering) {
                const startSpaces = text.length - text.trimStart().length
                text = " ".repeat(startSpaces - 2) + "> " + text.trimStart()
            }
        } else {
            text = this.hovering ? `> ${this.text}  ` : `  ${this.text}  `
        }

        const offset = Math.floor((this.width - text.length * TEXT_PIXEL_WIDTH) / 2)

        const hoverColor = Color.WHITE
        const defaultColor = this.hoverable ? Color.GREEN_5 : hoverColor

        return [
            new TextRender(
                text.toUpperCase(),
                this.position.plusX(-this.width / 2).plusX(offset),
                TEXT_SIZE,
                TEXT_FONT,
                this.hovering ? hoverColor : defaultColor,
                UIStateManager.UI_SPRITE_DEPTH
            ),
        ]
    }
}
