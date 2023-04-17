import { Component, Point } from "brigsby/dist"
import { Maths } from "brigsby/dist/util"
import { controls } from "../Controls"
import { TILE_SIZE } from "../graphics/Tilesets"
import { ClickableUI } from "./ClickableUI"
import { Color } from "./Color"
import { formatText, NO_BREAK_SPACE_CHAR, TextAlign, TEXT_PIXEL_WIDTH } from "./Text"
import { UI_SPRITE_DEPTH } from "./UiConstants"
import { UISounds } from "./UISounds"

export class MainMenuButton extends Component {
    private readonly width: number = 500

    private readonly centerPos: Point
    private readonly text: string
    private readonly onClick: () => void
    private readonly onHover: () => void
    readonly hoverable: boolean
    private hovering: boolean = false

    constructor({
        centerPos,
        text,
        onClick,
        onHover,
        hoverable,
        autoSelect,
    }: {
        centerPos: Point
        text: string
        onClick: () => void
        onHover: () => void
        hoverable: boolean
        autoSelect: boolean
    }) {
        super()
        this.centerPos = centerPos.apply(Math.floor)
        this.text = text
        this.onClick = onClick
        this.onHover = onHover
        this.hoverable = hoverable

        this.awake = () => {
            if (hoverable) {
                this.entity.addComponent(new ClickableUI(text, centerPos, autoSelect))
            }
        }
    }

    update() {
        this.hovering =
            this.hoverable &&
            Maths.rectContains(
                this.centerPos.plusX(-this.width / 2).plusY(-4),
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
            const startSpaces = text.length - text.trimStart().length
            if (this.hovering) {
                text = NO_BREAK_SPACE_CHAR.repeat(startSpaces - 2) + "> " + text.trimStart()
            } else {
                text = NO_BREAK_SPACE_CHAR.repeat(startSpaces) + text.trimStart()
            }
        } else {
            const nbsp = NO_BREAK_SPACE_CHAR + NO_BREAK_SPACE_CHAR
            text = this.hovering ? `> ${this.text}${nbsp}` : `${nbsp}${this.text}${nbsp}`
        }

        const offset = Math.floor((this.width - text.length * TEXT_PIXEL_WIDTH) / 2)

        const hoverColor = Color.WHITE
        const defaultColor = this.hoverable ? Color.GREEN_5 : hoverColor

        return formatText({
            width: this.width,
            text: text.toUpperCase(),
            position: this.centerPos.plusX(-this.width / 2).plusX(offset),
            alignment: TextAlign.LEFT,
            color: this.hovering ? hoverColor : defaultColor,
            depth: UI_SPRITE_DEPTH,
        })
    }
}
