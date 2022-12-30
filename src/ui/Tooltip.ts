import { Component, Point, pt, UpdateData } from "brigsby/dist"
import { ImageRender } from "brigsby/dist/renderer"
import { SpriteTransform } from "brigsby/dist/sprites"
import { Lists } from "brigsby/dist/util"
import { controls } from "../Controls"
import { Tilesets, TILE_DIMENSIONS, TILE_SIZE } from "../graphics/Tilesets"
import { Color } from "./Color"
import { formatText, TEXT_PIXEL_WIDTH, TEXT_SIZE } from "./Text"

const DEPTH = Number.MAX_SAFE_INTEGER / 2 + 3
const MARGIN = 6
const TEXT_OFFSET = pt(MARGIN, MARGIN - 1)

/**
 * TODO: Maybe make this a singleton on the Cursor class?
 */
export class Tooltip extends Component {
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

        const position = controls.getMousePos()

        const longestLineLength = Lists.maxBy(this.text, (line) => line.length).length
        const width = longestLineLength * TEXT_PIXEL_WIDTH

        const leftPos = position.plus(new Point(TILE_SIZE / 2, -TILE_SIZE)).apply(Math.floor)
        const centerPos = leftPos.plus(new Point(TILE_SIZE, 0))
        const rightPos = leftPos
            .plus(new Point(width - TILE_SIZE + MARGIN * 2, 0))
            .apply(Math.floor)

        const spacing = 6
        const centerWidth = new Point(width + MARGIN * 2 - TILE_SIZE * 2, TILE_SIZE)

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
                            DEPTH
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
                            DEPTH
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
                            DEPTH
                        )
                    )
            )
        }

        this.tiles = tiles

        const totalWidth = width + MARGIN * 2
        if (position.x + totalWidth > updateData.dimensions.x) {
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
                    .plus(TEXT_OFFSET)
                    .plusY(-(this.text.length - 1) * (TEXT_SIZE + 4)),
                depth: DEPTH + 1,
            }),
        ]
    }
}
