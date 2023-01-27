import { Point } from "brigsby/dist"
import { RenderMethod, TextRender } from "brigsby/dist/renderer"
import { SpriteTransform } from "brigsby/dist/sprites"
import { ImageFilters } from "../graphics/ImageFilters"
import { Icon } from "../graphics/OneBitTileset"
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
 * All icon values must start with "ö", be 2 characters long,
 * and have a corresponding entry in {@link ICON_PLACEHOLDER_MAP}
 */
export enum TextIcon {
    GAMEPAD_DOWN = "ö0",
    GAMEPAD_UP = "ö1",
    GAMEPAD_LEFT = "öf",
    GAMEPAD_RIGHT = "ög",
    GAMEPAD_X = "öx",
    GAMEPAD_SQUARE = "ö2",
    GAMEPAD_TRIANGLE = "ö3",
    GAMEPAD_CIRCLE = "ö4",
    MOUSE_LEFT = "ö5",
    MOUSE_RIGHT = "ö6",
    FACE_VERY_SAD = "öa",
    FACE_SAD = "öb",
    FACE_NEUTRAL = "öc",
    FACE_HAPPY = "öd",
    FACE_VERY_HAPPY = "öe",
    COIN = "öh",
}

const ICON_PLACEHOLDER_PREFIX = "ö"
const ICON_PLACEHOLDER_REGEX = /ö./g

// maps placeholder -> one bit key
const ICON_PLACEHOLDER_MAP: Record<TextIcon, Icon> = {
    [TextIcon.GAMEPAD_DOWN]: "gamepad-down",
    [TextIcon.GAMEPAD_UP]: "gamepad-up",
    [TextIcon.GAMEPAD_LEFT]: "gamepad-left",
    [TextIcon.GAMEPAD_RIGHT]: "gamepad-right",
    [TextIcon.GAMEPAD_X]: "gamepad-x",
    [TextIcon.GAMEPAD_SQUARE]: "gamepad-square",
    [TextIcon.GAMEPAD_TRIANGLE]: "gamepad-triangle",
    [TextIcon.GAMEPAD_CIRCLE]: "gamepad-circle",
    [TextIcon.MOUSE_LEFT]: "leftClick",
    [TextIcon.MOUSE_RIGHT]: "rightClick",
    [TextIcon.FACE_VERY_SAD]: "face-sad2",
    [TextIcon.FACE_SAD]: "face-sad1",
    [TextIcon.FACE_NEUTRAL]: "face-neutral",
    [TextIcon.FACE_HAPPY]: "face-happy1",
    [TextIcon.FACE_VERY_HAPPY]: "face-happy2",
    [TextIcon.COIN]: "coin",
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

type FormatTextArgs = {
    text: string
    position: Point
    color?: Color
    width?: number
    alignment?: TextAlign
    lineSpacing?: number
    depth?: number
    dropShadow?: boolean
}

export const formatText = (args: FormatTextArgs): RenderMethod[] => {
    const result = formatTextInternal(args)

    if (args.dropShadow) {
        result.push(
            ...formatTextInternal({
                ...args,
                depth: args.depth - 1,
                position: args.position.plusX(-1).plusY(1),
                color: Color.RED_1,
            })
        )
    }

    return result
}

const formatTextInternal = ({
    text,
    position,
    color = Color.RED_2,
    width = Number.MAX_SAFE_INTEGER,
    alignment = TextAlign.LEFT,
    lineSpacing = 4,
    depth = UIStateManager.UI_SPRITE_DEPTH + 1,
}: FormatTextArgs): RenderMethod[] => {
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
