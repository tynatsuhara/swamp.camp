import { Point } from "../../engine/Point"
import { TextRender } from "../../engine/renderer/TextRender"

export const TEXT_PIXEL_WIDTH = 8
export const TEXT_SIZE = 8
export const TEXT_FONT = "Press Start 2P"

export const enum TextAlign {
    LEFT,
    CENTER,
    RIGHT
}

export const NO_BREAK_SPACE_CHAR = "∆"

export const formatText = (
    s: string, 
    color: string,
    position: Point, 
    width: number, 
    alignment: TextAlign = TextAlign.LEFT,
    lineSpacing: number = 4
): TextRender[] => {
    const rawRows = s.split("\n")
    
    const rows: string[] = []

    for (const rawRow of rawRows) {
        let row = ""
        const words = rawRow.split(" ")
        for (const word of words) {
            const newRow = row === "" ? word : (row + " " + word)
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
            offset = Math.floor((width - r.length*TEXT_PIXEL_WIDTH)/2)
        } else if (alignment === TextAlign.RIGHT) {
            offset = Math.floor(width - r.length*TEXT_PIXEL_WIDTH)
        }

        return new TextRender(
            // replace placeholder space character
            r.replaceAll(NO_BREAK_SPACE_CHAR, " "),
            position.plus(new Point(offset, i * (TEXT_SIZE+lineSpacing))), 
            TEXT_SIZE, 
            TEXT_FONT, 
            color
        )
    })
}