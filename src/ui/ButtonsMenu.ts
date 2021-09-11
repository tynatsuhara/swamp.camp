import { Point } from "brigsby/dist/Point"
import { TextButton } from "./TextButton"
import { UIStateManager } from "./UIStateManager"
import { TILE_SIZE, Tilesets } from "../graphics/Tilesets"
import { NineSlice } from "brigsby/dist/sprites/NineSlice"
import { TEXT_PIXEL_WIDTH } from "./Text"
import { Entity } from "brigsby/dist/Entity"

export type OptionButton = { 
    text: string, 
    fn: () => void,
    buttonColor: 'red'|'white',
    textColor: string,
    hoverColor: string
}

// TODO: Update this to use the color replace filter instead of different sprites
export const ButtonsMenu = {
    render: (
        screenDimensions: Point, 
        backgroundColor: "red"|"white",
        options: OptionButton[],
        offset: Point = Point.ZERO
    ): Entity => {
        const longestOption = Math.max(...options.map(o => o.text.length))

        const marginTop = 13
        const marginBottom = 12
        const marginSide = 9
        const buttonPadding = 3

        const dimensions = new Point(
            longestOption * TEXT_PIXEL_WIDTH + marginSide*2 + TextButton.margin*2, 
            (options.length-1)*buttonPadding + options.length*TILE_SIZE + marginTop + marginBottom
        )
        
        const topLeft = screenDimensions.div(2).minus(dimensions.div(2)).plus(offset)

        const backgroundTiles = NineSlice.makeStretchedNineSliceComponents(
            backgroundColor === "red" ? Tilesets.instance.oneBit.getNineSlice("invBoxNW") : Tilesets.instance.outdoorTiles.getNineSlice("dialogueBG"), 
            topLeft,
            dimensions
        )
        backgroundTiles[0].transform.depth = UIStateManager.UI_SPRITE_DEPTH

        const e = new Entity()

        backgroundTiles.forEach(tile => e.addComponent(tile))

        options.forEach((option, i) => e.addComponent(
            new TextButton(
                topLeft.plus(new Point(dimensions.x/2-(TEXT_PIXEL_WIDTH*option.text.length/2)-TextButton.margin, marginTop + i * (TILE_SIZE + buttonPadding))),
                option.text,
                () => option.fn(),
                option.buttonColor,
                option.textColor,
                option.hoverColor
            )
        ))

        return e
    }
}