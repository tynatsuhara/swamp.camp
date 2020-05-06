import { Point } from "../../engine/point"
import { TextRender } from "../../engine/renderer/TextRender"

export const TEXT_PIXEL_WIDTH = 8
export const TEXT_SIZE = 8
export const TEXT_FONT = "Press Start 2P"

export const enum TextAlign {
    LEFT,
    CENTER,
    RIGHT
}

export const formatText = (
    s: string, 
    color: string,
    position: Point, 
    width: number, 
    alignment: TextAlign = TextAlign.LEFT,
    lineSpacing: number = 5
): TextRender[] => {
    const words = s.split(" ")
    const rows: string[] = []
    let row = ""

    for (const word of words) {
        const newRow = (row + " " + word).trim()
        if (newRow.length * TEXT_PIXEL_WIDTH < width) {
            row = newRow
        } else {
            rows.push(row)
            row = word
        }
    }
    rows.push(row)

    return rows.map((r, i) => {
        let offset = 0
        if (alignment === TextAlign.CENTER) {
            offset = Math.floor((width - r.length*TEXT_PIXEL_WIDTH)/2)
        } else if (alignment === TextAlign.RIGHT) {
            offset = Math.floor(width - r.length*TEXT_PIXEL_WIDTH)
        }
        return new TextRender(r, position.plus(new Point(offset, i * (TEXT_SIZE+lineSpacing))), TEXT_SIZE, TEXT_FONT, color)
    })
}