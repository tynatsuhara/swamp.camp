import { Point } from "brigsby/dist/Point"
import { TextRender } from "brigsby/dist/renderer/TextRender"
import { Color } from "./Color"
import { UIStateManager } from "./UIStateManager"

export const TEXT_PIXEL_WIDTH = 8
export const TEXT_SIZE = 8
export const TEXT_FONT = '"Press Start 2P"'

export const enum TextAlign {
    LEFT,
    CENTER,
    RIGHT,
}

export const NO_BREAK_SPACE_CHAR = "∆"

export const formatText = ({
    text,
    position,
    color = Color.DARK_RED,
    width = Number.MAX_SAFE_INTEGER,
    alignment = TextAlign.LEFT,
    lineSpacing = 4,
    depth = UIStateManager.UI_SPRITE_DEPTH + 1,
}: {
    text: string
    position: Point
    color?: Color
    width?: number
    alignment?: TextAlign
    lineSpacing?: number
    depth?: number
}): TextRender[] => {
    const rawRows = text.split("\n")

    const rows: string[] = []

    for (const rawRow of rawRows) {
        let row = ""
        const words = rawRow.split(" ")
        for (const word of words) {
            const newRow = row === "" ? word : row + " " + word
            if (newRow.length * TEXT_PIXEL_WIDTH < width) {
                row = newRow
            } else {
                rows.push(row)
                row = word
            }
        }
        rows.push(row)
    }

    return rows.map((r, i) => {
        let offset = 0
        if (alignment === TextAlign.CENTER) {
            offset = Math.floor((width - r.length * TEXT_PIXEL_WIDTH) / 2)
        } else if (alignment === TextAlign.RIGHT) {
            offset = Math.floor(width - r.length * TEXT_PIXEL_WIDTH)
        }

        return new TextRender(
            // replace placeholder space character
            r.replaceAll(NO_BREAK_SPACE_CHAR, " "),
            position.plus(new Point(offset, i * (TEXT_SIZE + lineSpacing))),
            TEXT_SIZE,
            TEXT_FONT,
            color,
            depth
        )
    })
}
