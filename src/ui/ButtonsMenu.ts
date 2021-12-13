import { Entity } from "brigsby/dist/Entity"
import { Point } from "brigsby/dist/Point"
import { NineSlice } from "brigsby/dist/sprites/NineSlice"
import { Tilesets, TILE_SIZE } from "../graphics/Tilesets"
import { TEXT_PIXEL_WIDTH } from "./Text"
import { TextButton } from "./TextButton"
import { UIStateManager } from "./UIStateManager"

export type OptionButton = {
    text: string
    fn: () => void
    buttonColor: "red" | "white"
    textColor: string
    hoverColor: string
}

// TODO: Update this to use the color replace filter instead of different sprites
export const ButtonsMenu = {
    render: (
        background: "red" | "white" | "none",
        options: OptionButton[],
        centerPos: Point
    ): Entity => {
        const longestOption = Math.max(...options.map((o) => o.text.length))

        const marginTop = 13
        const marginBottom = 12
        const marginSide = 9
        const buttonPadding = 3

        const dimensions = new Point(
            longestOption * TEXT_PIXEL_WIDTH + marginSide * 2 + TextButton.margin * 2,
            (options.length - 1) * buttonPadding +
                options.length * TILE_SIZE +
                marginTop +
                marginBottom
        )

        const topLeft = centerPos.minus(dimensions.div(2))
        const e = new Entity()

        if (background !== "none") {
            const backgroundTiles = NineSlice.makeStretchedNineSliceComponents(
                background === "red"
                    ? Tilesets.instance.oneBit.getNineSlice("invBoxNW")
                    : Tilesets.instance.outdoorTiles.getNineSlice("dialogueBG"),
                topLeft,
                dimensions
            )
            backgroundTiles[0].transform.depth = UIStateManager.UI_SPRITE_DEPTH + 1
            backgroundTiles.forEach((tile) => e.addComponent(tile))
        }

        options.forEach((option, i) =>
            e.addComponent(
                new TextButton(
                    topLeft.plus(
                        new Point(
                            dimensions.x / 2 -
                                (TEXT_PIXEL_WIDTH * option.text.length) / 2 -
                                TextButton.margin,
                            marginTop + i * (TILE_SIZE + buttonPadding)
                        )
                    ),
                    option.text,
                    () => option.fn(),
                    option.buttonColor,
                    option.textColor,
                    option.hoverColor
                )
            )
        )

        return e
    },
}
