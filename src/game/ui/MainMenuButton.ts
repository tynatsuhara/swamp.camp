import { Component } from "../../engine/Component"
import { UpdateData } from "../../engine/Engine"
import { Point } from "../../engine/Point"
import { TextRender } from "../../engine/renderer/TextRender"
import { rectContains } from "../../engine/util/Utils"
import { TILE_SIZE } from "../graphics/Tilesets"
import { Color } from "./Color"
import { TEXT_FONT, TEXT_PIXEL_WIDTH, TEXT_SIZE } from "./Text"
import { UIStateManager } from "./UIStateManager"

export class MainMenuButton extends Component {

    private readonly width: number = 500

    private readonly position: Point
    private readonly text: string
    private readonly onClick: () => void
    private readonly onHover: () => void

    private hovering: boolean = false

    constructor(
        position: Point, 
        text: string, 
        onClick: () => void, 
        onHover: () => void,
    ) {
        super()
        this.position = position.apply(Math.floor)
        this.text = text
        this.onClick = onClick
        this.onHover = onHover
    }

    update(updateData: UpdateData) {
        this.hovering = rectContains(
            this.position.plusX(-this.width/2).plusY(-4), 
            new Point(this.width, TILE_SIZE), 
            updateData.input.mousePos
        )

        if (this.hovering) {
            this.onHover()
        }

        if (this.hovering && updateData.input.isMouseDown) {
            this.onClick()
        }
    }

    getRenderMethods() {
        if (this.text === null) {
            return []
        }
        
        let text = this.text
        
        // if manually aligning whitespace, put "> " after leading spaces
        if (this.text.startsWith("  ")) {
            if(this.hovering) {
                const startSpaces = text.length - text.trimStart().length
                text = " ".repeat(startSpaces - 2) + "> " + text.trimStart()
            }
        } else {
            text = this.hovering ? `> ${this.text}  ` : `  ${this.text}  ` 
        }

        const offset = Math.floor((this.width - text.length*TEXT_PIXEL_WIDTH)/2)

        return [new TextRender(
            text.toUpperCase(),
            this.position.plusX(-this.width/2).plusX(offset), 
            TEXT_SIZE, 
            TEXT_FONT,             
            this.hovering ? Color.WHITE : Color.TEAL,
            UIStateManager.UI_SPRITE_DEPTH
        )]
    }
}