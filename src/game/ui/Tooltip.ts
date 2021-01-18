import { Component } from "../../engine/component"
import { TileComponent } from "../../engine/tiles/TileComponent"
import { Tilesets, TILE_SIZE } from "../graphics/Tilesets"
import { Point } from "../../engine/point"
import { TextRender } from "../../engine/renderer/TextRender"
import { TEXT_FONT, TEXT_PIXEL_WIDTH, TEXT_SIZE } from "./Text"
import { UpdateData } from "../../engine/engine"
import { Color } from "./Color"
import { UIStateManager } from "./UIStateManager"
import { Lists } from "../../engine/util/Lists"

export class Tooltip extends Component {
    
    position: Point = new Point(0, 0)

    private static readonly margin = 6
    private static readonly textOffset = new Point(Tooltip.margin, Tooltip.margin-1)
    private rawText: string
    private text: string[]

    private tiles: TileComponent[] = []
    private left: TileComponent[]
    private center: TileComponent[]
    private right: TileComponent[]

    say(text: string) {
        if (this.rawText === text) {
            return
        }

        this.clear()
        this.rawText = text
        this.text = text.split("\n")

        for (let i = 0; i < (this.text.length-1) * 2 + 1; i++ ){
            this.left.push(this.entity.addComponent(Tilesets.instance.oneBit.getTileSource("tooltipLeft").toComponent()))
            this.center.push(this.entity.addComponent(Tilesets.instance.oneBit.getTileSource("tooltipCenter").toComponent()))
            this.right.push(this.entity.addComponent(Tilesets.instance.oneBit.getTileSource("tooltipRight").toComponent()))
        }

        this.tiles = this.left.concat(this.center, this.right)
    }

    clear() {
        this.rawText = null
        this.text = null
        this.tiles.forEach(t => t.delete())
        this.tiles = []
        this.left = []
        this.center = []
        this.right = []
    }

    update(updateData: UpdateData) {
        this.tiles.forEach(t => {
            t.enabled = !!this.text
            t.transform.depth = UIStateManager.UI_SPRITE_DEPTH + 1
        })

        if (!this.text) {
            return
        }

        const longestLineLength = Lists.maxBy(this.text, line => line.length).length
        const width = longestLineLength * TEXT_PIXEL_WIDTH

        const leftPos = this.position.plus(new Point(TILE_SIZE/2, -TILE_SIZE)).apply(Math.floor)
        const centerPos = leftPos.plus(new Point(TILE_SIZE, 0))
        const rightPos = leftPos.plus(new Point(width - TILE_SIZE + Tooltip.margin * 2, 0)).apply(Math.floor)

        const spacing = 6
        this.left.forEach((t, i) => t.transform.position = leftPos.plusY(-i * spacing))
        this.center.forEach((t, i) => t.transform.position = centerPos.plusY(-i * spacing))
        this.right.forEach((t, i) => t.transform.position = rightPos.plusY(-i * spacing))

        this.center.forEach(t => t.transform.dimensions = new Point(width + Tooltip.margin * 2 - TILE_SIZE*2, TILE_SIZE))

        const totalWidth = width + Tooltip.margin * 2
        if (this.position.x + totalWidth > updateData.dimensions.x) {
            // shift left
            this.tiles.forEach(t => t.transform.position = t.transform.position.plusX(-totalWidth - TILE_SIZE))
        }
    }

    getRenderMethods() {
        if (!this.text) {
            return []
        }
        return this.text.map((line, index) => new TextRender(
            line,
            this.left[0].transform.position.plus(Tooltip.textOffset).plusY((this.text.length-index-1) * -(TEXT_SIZE+4)),
            TEXT_SIZE,
            TEXT_FONT,
            Color.DARK_RED,
            UIStateManager.UI_SPRITE_DEPTH + 2
        ))
    }
}