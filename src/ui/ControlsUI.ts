import { Component } from "brigsby/dist/Component"
import { GamepadButton } from "brigsby/dist/Input"
import { Point } from "brigsby/dist/Point"
import { RenderMethod } from "brigsby/dist/renderer/RenderMethod"
import { SpriteTransform } from "brigsby/dist/sprites/SpriteTransform"
import { Camera } from "../cutscenes/Camera"
import { Tilesets, TILE_SIZE } from "../graphics/Tilesets"
import { ButtonIndicator } from "./ButtonIndicator"
import { Color } from "./Color"
import { formatText, TextAlign } from "./Text"
import { UIStateManager } from "./UIStateManager"

/**
 * Controls that need to be shown here:
 *   - Attack        | m1  | r1 / r2
 *   - Block         | m2  | l1 / l2
 *   - Move          |wasd | left stick
 *   - Jump          |space| square
 *   - Roll          |shift| circle
 *   - Inventory     | tab | d-pad up
 *   - Map           |  m  | d-pad right
 *   - Sheath weapon |  f  | d-pad left
 */

const format = (text: string, position: Point) =>
    formatText({
        text,
        color: Color.WHITE,
        position: position.plusY(5),
        width: COLUMN_WIDTH,
        alignment: TextAlign.CENTER,
    })

type ControlRender = {
    kbm: (topLeft: Point) => RenderMethod[]
    gamepad: (topLeft: Point) => RenderMethod[]
}

const CONTROLS: { [key: string]: ControlRender } = {
    [`Attack`]: {
        kbm: (pos) => [
            Tilesets.instance.oneBit.getTileSource("leftClick").toImageRender(
                SpriteTransform.new({
                    position: pos.plusX(ICON_OFFSET),
                    depth: UIStateManager.UI_SPRITE_DEPTH,
                })
            ),
        ],
        gamepad: (pos) => format("R1/R2", pos),
    },
    [`Block`]: {
        kbm: (pos) => [
            Tilesets.instance.oneBit.getTileSource("rightClick").toImageRender(
                SpriteTransform.new({
                    position: pos.plusX(ICON_OFFSET),
                    depth: UIStateManager.UI_SPRITE_DEPTH,
                })
            ),
        ],
        gamepad: (pos) => format("L1/L2", pos),
    },
    [`Move`]: {
        kbm: (pos) => format("W/A/S/D", pos),
        gamepad: (pos) => [
            Tilesets.instance.oneBit.getTileSource("joystick-up").toImageRender(
                SpriteTransform.new({
                    position: pos.plusX(ICON_OFFSET),
                    depth: UIStateManager.UI_SPRITE_DEPTH,
                })
            ),
        ],
    },
    [`Jump`]: {
        kbm: (pos) => format("SPACE", pos),
        gamepad: (pos) =>
            new ButtonIndicator(pos.plusX(ICON_OFFSET), GamepadButton.SQUARE).getRenderMethods(),
    },
    [`Roll`]: {
        kbm: (pos) => format("SHIFT", pos),
        gamepad: (pos) =>
            new ButtonIndicator(pos.plusX(ICON_OFFSET), GamepadButton.CIRCLE).getRenderMethods(),
    },
    [`Inventory`]: {
        kbm: (pos) => format("Q", pos),
        gamepad: (pos) =>
            new ButtonIndicator(pos.plusX(ICON_OFFSET), GamepadButton.UP).getRenderMethods(),
    },
    [`Minimap`]: {
        kbm: (pos) => format("M", pos),
        gamepad: (pos) =>
            new ButtonIndicator(pos.plusX(ICON_OFFSET), GamepadButton.RIGHT).getRenderMethods(),
    },
    [`Sheath`]: {
        kbm: (pos) => format("F", pos),
        gamepad: (pos) =>
            new ButtonIndicator(pos.plusX(ICON_OFFSET), GamepadButton.DOWN).getRenderMethods(),
    },
    [`Options`]: {
        kbm: (pos) => format("TAB", pos),
        gamepad: (pos) => format("START", pos),
    },
}

const COLUMN_WIDTH = 90
const ICON_OFFSET = (COLUMN_WIDTH - TILE_SIZE) / 2
const ROW_HEIGHT = 18

export class ControlsUI extends Component {
    /**
     * @param topMargin the distance from the top (if undefined, will be centered vertically)
     */
    constructor(topMargin: number) {
        super()

        this.getRenderMethods = () => {
            const topLeft = new Point(
                (Camera.instance.dimensions.x - COLUMN_WIDTH * 3) / 2,
                topMargin === undefined
                    ? (Camera.instance.dimensions.y - ROW_HEIGHT * Object.keys(CONTROLS).length) / 2
                    : topMargin
            )

            const result: RenderMethod[] = []

            Object.entries(CONTROLS).forEach(([name, { kbm, gamepad }], i) => {
                const rowPos = topLeft.plusY(i * ROW_HEIGHT)

                result.push(...format(name, rowPos))
                result.push(...kbm(rowPos.plusX(COLUMN_WIDTH)))
                result.push(...gamepad(rowPos.plusX(COLUMN_WIDTH * 2)))
            })

            return result
        }
    }
}
