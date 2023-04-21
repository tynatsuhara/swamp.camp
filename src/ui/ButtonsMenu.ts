import { Entity, Point } from "brigsby/dist"
import { NineSlice } from "brigsby/dist/sprites"
import { Tilesets, TILE_SIZE } from "../graphics/Tilesets"
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
        options: OptionButton[],
        centerPos: Point
    ): Entity => {
        const longestOption = Math.max(...options.map((o) => o.text.length))

        const dimensions = new Point(
            longestOption * TEXT_PIXEL_WIDTH + MARGIN_SIDE * 2 + TextButton.margin * 2,
            (options.length - 1) * BUTTON_PADDING +
                options.length * TILE_SIZE +
                MARGIN_TOP +
                MARGIN_BOTTOM
        )

        const topLeft = centerPos.minus(dimensions.div(2))
        const e = new Entity()

        if (background !== "none") {
            const { sprites } = NineSlice.makeStretchedNineSliceComponents(
                background === "red"
                    ? Tilesets.instance.oneBit.getNineSlice("invBoxNW")
                    : Tilesets.instance.outdoorTiles.getNineSlice("dialogueBG"),
                dimensions,
                { position: topLeft, depth: UI_SPRITE_DEPTH + 1 }
            )
            sprites.forEach((tile) => e.addComponent(tile))
        }

        options.forEach((option, index) =>
            e.addComponent(
                new TextButton({
                    index,
                    key: `${key}-${index}`,
                    position: topLeft.plus(
                        new Point(
                            dimensions.x / 2 -
                                (TEXT_PIXEL_WIDTH * option.text.length) / 2 -
                                TextButton.margin,
                            MARGIN_TOP + index * (TILE_SIZE + BUTTON_PADDING)
                        )
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
        )

        return e
    },
}
