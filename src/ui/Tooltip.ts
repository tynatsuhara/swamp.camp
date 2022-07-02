import { Component, Point, UpdateData } from "brigsby/lib"
import { ImageRender } from "brigsby/lib/renderer"
import { SpriteTransform } from "brigsby/lib/sprites"
import { Lists } from "brigsby/lib/util"
import { Tilesets, TILE_DIMENSIONS, TILE_SIZE } from "../graphics/Tilesets"
import { Color } from "./Color"
import { formatText, TEXT_PIXEL_WIDTH, TEXT_SIZE } from "./Text"
import { UIStateManager } from "./UIStateManager"

export class Tooltip extends Component {
    position: Point = new Point(0, 0)

    private static readonly margin = 6
    private static readonly textOffset = new Point(Tooltip.margin, Tooltip.margin - 1)
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

        const longestLineLength = Lists.maxBy(this.text, (line) => line.length).length
        const width = longestLineLength * TEXT_PIXEL_WIDTH

        const leftPos = this.position.plus(new Point(TILE_SIZE / 2, -TILE_SIZE)).apply(Math.floor)
        const centerPos = leftPos.plus(new Point(TILE_SIZE, 0))
        const rightPos = leftPos
            .plus(new Point(width - TILE_SIZE + Tooltip.margin * 2, 0))
            .apply(Math.floor)

        const spacing = 6
        const centerWidth = new Point(width + Tooltip.margin * 2 - TILE_SIZE * 2, TILE_SIZE)

        const tiles: ImageRender[] = []
        for (let i = 0; i < (this.text.length - 1) * 2 + 1; i++) {
            // left
            tiles.push(
                Tilesets.instance.oneBit
                    .getTileSource("tooltipLeft")
                    .toImageRender(
                        new SpriteTransform(
                            leftPos.plusY(-i * spacing),
                            TILE_DIMENSIONS,
                            0,
                            false,
                            false,
                            UIStateManager.UI_SPRITE_DEPTH + 1
                        )
                    )
            )
            // center
            tiles.push(
                Tilesets.instance.oneBit
                    .getTileSource("tooltipCenter")
                    .toImageRender(
                        new SpriteTransform(
                            centerPos.plusY(-i * spacing),
                            centerWidth,
                            0,
                            false,
                            false,
                            UIStateManager.UI_SPRITE_DEPTH + 1
                        )
                    )
            )
            // right
            tiles.push(
                Tilesets.instance.oneBit
                    .getTileSource("tooltipRight")
                    .toImageRender(
                        new SpriteTransform(
                            rightPos.plusY(-i * spacing),
                            TILE_DIMENSIONS,
                            0,
                            false,
                            false,
                            UIStateManager.UI_SPRITE_DEPTH + 1
                        )
                    )
            )
        }

        this.tiles = tiles

        const totalWidth = width + Tooltip.margin * 2
        if (this.position.x + totalWidth > updateData.dimensions.x) {
            // shift left
            this.tiles.forEach((t) => (t.position = t.position.plusX(-totalWidth - TILE_SIZE)))
        }
    }

    getRenderMethods() {
        if (!this.text) {
            return []
        }
        return [
            ...this.tiles,
            ...formatText({
                text: this.text.join("\n"),
                color: Color.RED_2,
                position: this.tiles[0].position
                    .plus(Tooltip.textOffset)
                    .plusY(-(this.text.length - 1) * (TEXT_SIZE + 4)),
                depth: UIStateManager.UI_SPRITE_DEPTH + 2,
            }),
        ]
    }
}
