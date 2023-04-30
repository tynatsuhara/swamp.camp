import { Entity, Point } from "brigsby/dist"
import { NineSlice } from "brigsby/dist/sprites"
import { TILE_SIZE, Tilesets } from "../graphics/Tilesets"
import { TEXT_PIXEL_WIDTH } from "./Text"
import { TextButton } from "./TextButton"
import { UI_SPRITE_DEPTH } from "./UiConstants"

export type OptionButton = {
    text: string
    fn: () => void
    onMouseOver?: () => void
    onMouseOut?: () => void
    buttonColor: "red" | "white"
    textColor: string
    hoverColor: string
}

const MARGIN_TOP = 13
const MARGIN_BOTTOM = 12
const MARGIN_SIDE = 9
const BUTTON_PADDING = 3

// TODO: Update this to use the color replace filter instead of different sprites
export const ButtonsMenu = {
    render: (
        key: string, // for ClickableUI keys
        background: "red" | "white" | "none",
        options: Array<OptionButton | Array<OptionButton>>,
        centerPos: Point
    ): { entity: Entity; dimensions: Point } => {
        const computeButtonWidth = (txt: string) =>
            txt.length * TEXT_PIXEL_WIDTH + TextButton.margin * 2

        const computeRowWidth = (row: Array<OptionButton>) => {
            const length = row["length"] as number
            return (
                (row as Array<OptionButton>)
                    .map((op) => computeButtonWidth(op.text))
                    .reduce((a, b) => a + b) +
                (length - 1) * BUTTON_PADDING
            )
        }

        const longestRowWidth = Math.max(
            ...options.map((row) => {
                return computeRowWidth((row["length"] ? row : [row]) as Array<OptionButton>)
            })
        )

        const dimensions = new Point(
            longestRowWidth + MARGIN_SIDE * 2,
            (options.length - 1) * BUTTON_PADDING +
                options.length * TILE_SIZE +
                MARGIN_TOP +
                MARGIN_BOTTOM
        )

        const topLeft = centerPos.minus(dimensions.div(2))
        const entity = new Entity()

        if (background !== "none") {
            const { sprites } = NineSlice.makeStretchedNineSliceComponents(
                background === "red"
                    ? Tilesets.instance.oneBit.getNineSlice("invBoxNW")
                    : Tilesets.instance.outdoorTiles.getNineSlice("dialogueBG"),
                dimensions,
                { position: topLeft, depth: UI_SPRITE_DEPTH + 1 }
            )
            sprites.forEach((tile) => entity.addComponent(tile))
        }

        let overallButtonIndex = 0

        options.forEach((row, rowIndex) => {
            const options = (row["length"] ? row : [row]) as Array<OptionButton>
            const rowWidth = computeRowWidth(options)
            let colOffset = -rowWidth / 2

            options.forEach((option, colIndex) => {
                const btnWidth = TEXT_PIXEL_WIDTH * option.text.length
                const colPos = colOffset + dimensions.x / 2
                // (TEXT_PIXEL_WIDTH * option.text.length) / 2 -
                // TextButton.margin

                entity.addComponent(
                    new TextButton({
                        index: overallButtonIndex,
                        key: `${key}-${overallButtonIndex}`,
                        position: topLeft.plus(
                            new Point(colPos, MARGIN_TOP + rowIndex * (TILE_SIZE + BUTTON_PADDING))
                        ),
                        text: option.text,
                        onClick: () => option.fn(),
                        onMouseOver: () => option.onMouseOver?.(),
                        onMouseOut: () => option.onMouseOut?.(),
                        buttonColor: option.buttonColor,
                        textColor: option.textColor,
                        hoverColor: option.hoverColor,
                    })
                )

                colOffset += btnWidth + TextButton.margin * 2 + BUTTON_PADDING
                overallButtonIndex++
            })
        })

        return { entity, dimensions }
    },
}
