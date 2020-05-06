import { Component } from "../../engine/component"
import { Point } from "../../engine/point"
import { RenderMethod } from "../../engine/renderer/RenderMethod"
import { TileComponent } from "../../engine/tiles/TileComponent"
import { Tilesets, TILE_SIZE } from "../graphics/Tilesets"
import { TEXT_PIXEL_WIDTH, TEXT_SIZE, TEXT_FONT } from "./Text"
import { TextRender } from "../../engine/renderer/TextRender"
import { Color } from "./Color"
import { UIStateManager } from "./UIStateManager"
import { UpdateData } from "../../engine/engine"
import { rectContains } from "../../engine/util/utils"

export class TextButton extends Component {

    private static readonly margin = 6
    private static readonly textOffset = new Point(TextButton.margin, TextButton.margin-2)

    private readonly position: Point
    private readonly text: string
    readonly width: number

    private left: TileComponent
    private center: TileComponent
    private right: TileComponent
    private onClick: () => void
    private hovering: boolean

    constructor(position: Point, text: string, onClick: () => void) {
        super()
        this.position = position
        this.text = text
        this.onClick = onClick
        this.width = this.text.length * TEXT_PIXEL_WIDTH + TextButton.margin * 2

        this.start = () => {
            this.left = this.entity.addComponent(Tilesets.instance.oneBit.getTileSource("btnLeft").toComponent())
            this.center = this.entity.addComponent(Tilesets.instance.oneBit.getTileSource("btnCenter").toComponent())
            this.right = this.entity.addComponent(Tilesets.instance.oneBit.getTileSource("btnRight").toComponent())

            const leftPos = this.position.apply(Math.floor)
            const centerPos = leftPos.plus(new Point(TILE_SIZE, 0))
            const rightPos = leftPos.plus(new Point(this.width - TILE_SIZE, 0)).apply(Math.floor)
    
            this.left.transform.position = leftPos
            this.center.transform.position = centerPos
            this.right.transform.position = rightPos
    
            this.center.transform.dimensions = new Point(this.width + TextButton.margin * 2 - TILE_SIZE*2, TILE_SIZE)

            Array.from([this.left, this.center, this.right]).forEach(t => t.transform.depth = UIStateManager.UI_SPRITE_DEPTH + 1)
        }
    }

    update(updateData: UpdateData) {
        this.hovering = rectContains(this.position, new Point(this.width, TILE_SIZE), updateData.input.mousePos)
        if (this.hovering && updateData.input.isMouseDown) {
            this.onClick()
        }
    }

    getRenderMethods() {
        if (this.text === null) {
            return []
        }
        return [new TextRender(
            this.text,
            this.left.transform.position.plus(TextButton.textOffset),
            TEXT_SIZE,
            TEXT_FONT,
            this.hovering ? Color.DARK_RED : Color.WHITE,
            UIStateManager.UI_SPRITE_DEPTH + 2
        )]
    }
}