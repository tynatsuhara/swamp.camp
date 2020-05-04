import { Component } from "../../engine/component"
import { TileComponent } from "../../engine/tiles/TileComponent"
import { Tilesets, TILE_SIZE } from "../graphics/Tilesets"
import { Point } from "../../engine/point"
import { TextRender } from "../../engine/renderer/TextRender"
import { TEXT_FONT, TEXT_PIXEL_WIDTH, TEXT_SIZE } from "./Text"
import { UpdateData } from "../../engine/engine"
import { Color } from "./Color"
import { UIStateManager } from "./UIStateManager"

export class Tooltip extends Component {
    
    position: Point = new Point(0, 0)

    private static readonly margin = 6
    private static readonly textOffset = new Point(Tooltip.margin, Tooltip.margin-1)
    private text: string

    private left: TileComponent
    private center: TileComponent
    private right: TileComponent

    constructor(text: string) {
        super()

        this.text = text

        this.start = () => {
            this.left = this.entity.addComponent(Tilesets.instance.oneBit.getTileSource("tooltipLeft").toComponent())
            this.center = this.entity.addComponent(Tilesets.instance.oneBit.getTileSource("tooltipCenter").toComponent())
            this.right = this.entity.addComponent(Tilesets.instance.oneBit.getTileSource("tooltipRight").toComponent())
        }
    }

    say(text: string) {
        this.text = text
    }

    clear() {
        this.text = null
    }

    update(updateData: UpdateData) {
        const tiles = [this.left, this.center, this.right]
        tiles.forEach(t => {
            t.enabled = this.text !== null
            t.transform.depth = UIStateManager.UI_SPRITE_DEPTH + 1
        })

        if (this.text === null) {
            return
        }
        
        const width = this.text.length * TEXT_PIXEL_WIDTH

        const leftPos = this.position.plus(new Point(TILE_SIZE/2, -TILE_SIZE)).apply(Math.floor)
        const centerPos = leftPos.plus(new Point(TILE_SIZE, 0))
        const rightPos = leftPos.plus(new Point(width - TILE_SIZE + Tooltip.margin * 2, 0)).apply(Math.floor)

        this.left.transform.position = leftPos
        this.center.transform.position = centerPos
        this.right.transform.position = rightPos

        this.center.transform.dimensions = new Point(width + Tooltip.margin * 2 - TILE_SIZE*2, TILE_SIZE)
    }

    getRenderMethods() {
        if (this.text === null) {
            return []
        }
        return [new TextRender(
            this.text,
            this.left.transform.position.plus(Tooltip.textOffset),
            TEXT_SIZE,
            TEXT_FONT,
            Color.DARK_RED,
        )]
    }
}