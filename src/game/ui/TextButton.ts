import { Component } from "../../engine/Component"
import { UpdateData } from "../../engine/Engine"
import { Point } from "../../engine/Point"
import { ImageRender } from "../../engine/renderer/ImageRender"
import { TextRender } from "../../engine/renderer/TextRender"
import { TileTransform } from "../../engine/tiles/TileTransform"
import { rectContains } from "../../engine/util/Utils"
import { Tilesets, TILE_SIZE } from "../graphics/Tilesets"
import { TEXT_FONT, TEXT_PIXEL_WIDTH, TEXT_SIZE } from "./Text"
import { UIStateManager } from "./UIStateManager"

export class TextButton extends Component {

    static readonly margin = 6
    private static readonly textOffset = new Point(TextButton.margin, TextButton.margin-2)

    private readonly position: Point
    private readonly text: string
    readonly width: number

    private left: ImageRender
    private center: ImageRender
    private right: ImageRender
    private onClick: () => void
    private hovering: boolean
    private textColor: string
    private hoverColor: string

    constructor(
        position: Point, 
        text: string, 
        onClick: () => void, 
        buttonColor: 'red'|'white',
        textColor: string,
        hoverColor: string
    ) {
        super()
        this.position = position
        this.text = text
        this.onClick = onClick
        this.textColor = textColor
        this.hoverColor = hoverColor
        this.width = this.text.length * TEXT_PIXEL_WIDTH + TextButton.margin * 2

        this.start = () => {
            const leftPos = this.position.apply(Math.floor)
            const centerPos = leftPos.plus(new Point(TILE_SIZE, 0))
            const rightPos = leftPos.plus(new Point(this.width - TILE_SIZE, 0)).apply(Math.floor)
    
            this.left = Tilesets.instance.oneBit.getTileSource(`btnLeft_${buttonColor}`).toImageRender(new TileTransform(leftPos))
            this.center = Tilesets.instance.oneBit.getTileSource(`btnCenter_${buttonColor}`).toImageRender(
                new TileTransform(centerPos, new Point(this.width + TextButton.margin * 2 - TILE_SIZE*2, TILE_SIZE))
            )
            this.right = Tilesets.instance.oneBit.getTileSource(`btnRight_${buttonColor}`).toImageRender(new TileTransform(rightPos))
    
            Array.from([this.left, this.center, this.right]).forEach(t => t.depth = UIStateManager.UI_SPRITE_DEPTH + 1)
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
            this.left.position.plus(TextButton.textOffset),
            TEXT_SIZE,
            TEXT_FONT,
            this.hovering ? this.hoverColor : this.textColor,
            UIStateManager.UI_SPRITE_DEPTH + 2
        ), this.left, this.center, this.right]
    }
}