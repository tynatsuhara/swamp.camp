import { Component } from "../../engine/component"
import { UpdateData } from "../../engine/engine"
import { Point } from "../../engine/point"
import { TextRender } from "../../engine/renderer/TextRender"
import { rectContains } from "../../engine/util/utils"
import { TILE_SIZE } from "../graphics/Tilesets"
import { Color } from "./Color"
import { TEXT_FONT, TEXT_PIXEL_WIDTH, TEXT_SIZE } from "./Text"
import { UIStateManager } from "./UIStateManager"

export class MainMenuButton extends Component {

    private readonly position: Point
    private readonly text: string
    readonly width: number = 500

    private onClick: () => void
    private hovering: boolean

    constructor(
        position: Point, 
        text: string, 
        onClick: () => void, 
    ) {
        super()
        this.position = position.apply(Math.floor)
        this.text = text
        this.onClick = onClick
    }

    update(updateData: UpdateData) {
        this.hovering = rectContains(
            this.position.plusX(-this.width/2).plusY(-4), 
            new Point(this.width, TILE_SIZE), 
            updateData.input.mousePos
        )

        if (this.hovering && updateData.input.isMouseDown) {
            this.onClick()
        }
    }

    getRenderMethods() {
        if (this.text === null) {
            return []
        }
        const text = this.hovering 
            ? `> ${this.text}  ` 
            : `  ${this.text}  ` 

        const offset = Math.floor((this.width - text.length*TEXT_PIXEL_WIDTH)/2)

        return [new TextRender(
            text.toUpperCase(),
            this.position.plusX(-this.width/2).plusX(offset), 
            TEXT_SIZE, 
            TEXT_FONT,             
            this.hovering ? Color.WHITE : Color.DARK_BLUE,
            UIStateManager.UI_SPRITE_DEPTH
        )]
    }
}