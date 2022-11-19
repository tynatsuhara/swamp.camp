import { Component, GamepadButton, Point } from "brigsby/dist"
import { RenderMethod } from "brigsby/dist/renderer"
import { SpriteTransform } from "brigsby/dist/sprites"
import { Camera } from "../cutscenes/Camera"
import { TextOverlayManager } from "../cutscenes/TextOverlayManager"
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

const renderText = (text: string, position: Point) =>
    formatText({
        text,
        color: Color.WHITE,
        position: position.plusY(5),
        width: COLUMN_WIDTH,
        alignment: TextAlign.CENTER,
        depth: TextOverlayManager.DEPTH,
    })

const renderButton = (pos: Point, button: GamepadButton) =>
    new ButtonIndicator(pos.plusX(ICON_OFFSET), button, TextOverlayManager.DEPTH).getRenderMethods()

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
        gamepad: (pos) => renderText("R1/R2", pos),
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
        gamepad: (pos) => renderText("L1/L2", pos),
    },
    [`Move`]: {
        kbm: (pos) => renderText("W/A/S/D", pos),
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
        kbm: (pos) => renderText("SPACE", pos),
        gamepad: (pos) => renderButton(pos, GamepadButton.SQUARE),
    },
    [`Roll`]: {
        kbm: (pos) => renderText("SHIFT", pos),
        gamepad: (pos) => renderButton(pos, GamepadButton.CIRCLE),
    },
    [`Inventory`]: {
        kbm: (pos) => renderText("Q", pos),
        gamepad: (pos) => renderButton(pos, GamepadButton.UP),
    },
    [`Minimap`]: {
        kbm: (pos) => renderText("M", pos),
        gamepad: (pos) => renderButton(pos, GamepadButton.RIGHT),
    },
    [`Sheath`]: {
        kbm: (pos) => renderText("F", pos),
        gamepad: (pos) => renderButton(pos, GamepadButton.DOWN),
    },
    [`Options`]: {
        kbm: (pos) => renderText("TAB", pos),
        gamepad: (pos) => renderText("START", pos),
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

                result.push(...renderText(name, rowPos))
                result.push(...kbm(rowPos.plusX(COLUMN_WIDTH)))
                result.push(...gamepad(rowPos.plusX(COLUMN_WIDTH * 2)))
            })

            return result
        }
    }
}
