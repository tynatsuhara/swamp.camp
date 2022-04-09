import { Point } from "brigsby/dist/Point"
import { RenderMethod } from "brigsby/dist/renderer/RenderMethod"
import { TextRender } from "brigsby/dist/renderer/TextRender"
import { SpriteTransform } from "brigsby/dist/sprites/SpriteTransform"
import { ImageFilters } from "../graphics/ImageFilters"
import { Tilesets } from "../graphics/Tilesets"
import { Color } from "./Color"
import { UIStateManager } from "./UIStateManager"

export const TEXT_PIXEL_WIDTH = 8
export const TEXT_SIZE = 8
export const TEXT_FONT = "Press Start 2P"

export const enum TextAlign {
    LEFT,
    CENTER,
    RIGHT,
}

export const NO_BREAK_SPACE_CHAR = "∆"

/**
 * A special string which will be replaced with a sprite.
 * All icon values must start with "λ", be 2 characters long,
 * and have a corresponding entry in {@link ICON_PLACEHOLDER_MAP}
 */
export enum TextIcon {
    GAMEPAD_UP = "λ1",
    GAMEPAD_X = "λx",
    GAMEPAD_SQUARE = "λ2",
    GAMEPAD_TRIANGLE = "λ3",
    FACE_VERY_SAD = "λ4",
    FACE_SAD = "λ5",
    FACE_NEUTRAL = "λ6",
    FACE_HAPPY = "λ7",
    FACE_VERY_HAPPY = "λ8",
}

const ICON_PLACEHOLDER_PREFIX = "λ"
const ICON_PLACEHOLDER_REGEX = /λ./g

// maps placeholder -> one bit key
const ICON_PLACEHOLDER_MAP = {
    [TextIcon.GAMEPAD_UP]: "gamepad-up",
    [TextIcon.GAMEPAD_X]: "gamepad-x",
    [TextIcon.GAMEPAD_SQUARE]: "gamepad-square",
    [TextIcon.GAMEPAD_TRIANGLE]: "gamepad-triangle",
    [TextIcon.FACE_VERY_SAD]: "face-sad2",
    [TextIcon.FACE_SAD]: "face-sad1",
    [TextIcon.FACE_NEUTRAL]: "face-neutral",
    [TextIcon.FACE_HAPPY]: "face-happy1",
    [TextIcon.FACE_VERY_HAPPY]: "face-happy2",
}

export const formatTextRows = (text: string, width: number) => {
    const rawRows = text.split("\n")
    const rows: string[] = []

    for (const rawRow of rawRows) {
        let row = ""
        const words = rawRow.split(" ")
        for (let word of words) {
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

    return rows
}

export const formatText = ({
    text,
    position,
    color = Color.RED_2,
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
}): RenderMethod[] => {
    const rows: string[] = formatTextRows(text, width)

    const rowPosition = (r: string, i: number): Point => {
        let offset = 0
        if (alignment === TextAlign.CENTER) {
            offset = Math.floor((width - r.length * TEXT_PIXEL_WIDTH) / 2)
        } else if (alignment === TextAlign.RIGHT) {
            offset = Math.floor(width - r.length * TEXT_PIXEL_WIDTH)
        }
        return position.plus(new Point(offset, i * (TEXT_SIZE + lineSpacing)))
    }

    const iconRenders: RenderMethod[] = []
    for (let i = 0, lineSearchStart = 0; i < rows.length; ) {
        const row = rows[i]
        const placeholderIndex = row.indexOf(ICON_PLACEHOLDER_PREFIX, lineSearchStart)
        if (placeholderIndex === -1) {
            i++
            lineSearchStart = 0
        } else {
            const iconKey =
                ICON_PLACEHOLDER_MAP[row.substring(placeholderIndex, placeholderIndex + 2)]
            if (iconKey) {
                iconRenders.push(
                    Tilesets.instance.oneBit
                        .getTileSource(iconKey)
                        // TODO cache recolored icons
                        .filtered(ImageFilters.recolor([Color.WHITE, color]))
                        .toImageRender(
                            SpriteTransform.new({
                                position: rowPosition(row, i)
                                    .plusY(-4)
                                    .plusX(placeholderIndex * TEXT_PIXEL_WIDTH),
                                depth,
                            })
                        )
                )
            }
            lineSearchStart = placeholderIndex + 2
        }
    }

    const textLines = rows.map((r, i) => {
        return new TextRender(
            // replace placeholder space character
            r.replaceAll(NO_BREAK_SPACE_CHAR, " ").replaceAll(ICON_PLACEHOLDER_REGEX, "  "),
            rowPosition(r, i),
            TEXT_SIZE,
            TEXT_FONT,
            color,
            depth
        )
    })

    return [...iconRenders, ...textLines]
}
