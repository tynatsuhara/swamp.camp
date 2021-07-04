import { Component } from "../../engine/Component"
import { SpriteComponent } from "../../engine/sprites/SpriteComponent"
import { Tilesets, TILE_DIMENSIONS, TILE_SIZE } from "../graphics/Tilesets"
import { Point } from "../../engine/Point"
import { TextRender } from "../../engine/renderer/TextRender"
import { TEXT_FONT, TEXT_PIXEL_WIDTH, TEXT_SIZE } from "./Text"
import { UpdateData } from "../../engine/Engine"
import { Color } from "./Color"
import { UIStateManager } from "./UIStateManager"
import { Lists } from "../../engine/util/Lists"
import { ImageRender } from "../../engine/renderer/ImageRender"
import { SpriteTransform } from "../../engine/sprites/SpriteTransform"
import { RenderMethod } from "../../engine/renderer/RenderMethod"

export class Tooltip extends Component {
    
    position: Point = new Point(0, 0)

    private static readonly margin = 6
    private static readonly textOffset = new Point(Tooltip.margin, Tooltip.margin-1)
    private text: string[]

    private tiles: ImageRender[] = []

    say(text: string) {
        this.text = text.split("\n")
    }

    clear() {
        this.text = null
        this.tiles = []
    }

    update(updateData: UpdateData) {
        if (!this.text) {
            return
        }

        const longestLineLength = Lists.maxBy(this.text, line => line.length).length
        const width = longestLineLength * TEXT_PIXEL_WIDTH

        const leftPos = this.position.plus(new Point(TILE_SIZE/2, -TILE_SIZE)).apply(Math.floor)
        const centerPos = leftPos.plus(new Point(TILE_SIZE, 0))
        const rightPos = leftPos.plus(new Point(width - TILE_SIZE + Tooltip.margin * 2, 0)).apply(Math.floor)

        const spacing = 6
        const centerWidth = new Point(width + Tooltip.margin * 2 - TILE_SIZE*2, TILE_SIZE)

        const tiles: ImageRender[] = []
        for (let i = 0; i < (this.text.length-1) * 2 + 1; i++) {
            // left
            tiles.push(Tilesets.instance.oneBit.getTileSource("tooltipLeft").toImageRender(
                new SpriteTransform(leftPos.plusY(-i * spacing), TILE_DIMENSIONS, 0, false, false, UIStateManager.UI_SPRITE_DEPTH + 1)
            ))
            // center
            tiles.push(Tilesets.instance.oneBit.getTileSource("tooltipCenter").toImageRender(
                new SpriteTransform(centerPos.plusY(-i * spacing), centerWidth, 0, false, false, UIStateManager.UI_SPRITE_DEPTH + 1)
            ))
            // right
            tiles.push(Tilesets.instance.oneBit.getTileSource("tooltipRight").toImageRender(
                new SpriteTransform(rightPos.plusY(-i * spacing), TILE_DIMENSIONS, 0, false, false, UIStateManager.UI_SPRITE_DEPTH + 1)
            ))
        }

        this.tiles = tiles

        const totalWidth = width + Tooltip.margin * 2
        if (this.position.x + totalWidth > updateData.dimensions.x) {
            // shift left
            this.tiles.forEach(t => t.position = t.position.plusX(-totalWidth - TILE_SIZE))
        }
    }

    getRenderMethods() {
        if (!this.text) {
            return []
        }
        return this.text.map((line, index) => new TextRender(
            line,
            this.tiles[0].position.plus(Tooltip.textOffset).plusY((this.text.length-index-1) * -(TEXT_SIZE+4)),
            TEXT_SIZE,
            TEXT_FONT,
            Color.DARK_RED,
            UIStateManager.UI_SPRITE_DEPTH + 2
        ) as RenderMethod).concat(this.tiles)
    }
}