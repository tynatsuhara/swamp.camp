import { Component } from "brigsby/dist/Component"
import { Entity } from "brigsby/dist/Entity"
import { Point } from "brigsby/dist/Point"
import { RectRender } from "brigsby/dist/renderer/RectRender"
import { RenderMethod } from "brigsby/dist/renderer/RenderMethod"
import { Maths } from "brigsby/dist/util/Maths"
import { controls } from "../Controls"
import { TILE_SIZE } from "../graphics/Tilesets"
import { Color } from "./Color"
import { UIStateManager } from "./UIStateManager"

// array of [dark, light] pairs
// TODO support new colors
export const PLUME_COLORS: [Color, Color][] = [
    [Color.DARK_DARK_PINK, Color.DARK_PINK],
    [Color.DARK_PINK, Color.PINK],
    [Color.PINK, Color.LIGHT_PINK],
    [Color.DARK_RED, Color.RED],
    [Color.RED_2, Color.RED_3],
    [Color.RED_3, Color.RED_5],
    [Color.RED_5, Color.RED_6],
    [Color.GREEN_5, Color.LIME],
    [Color.DARK_GREEN, Color.GREEN_5],
    [Color.DARK_DARK_BLUE, Color.DARK_BLUE],
    [Color.DARK_BLUE, Color.BLUE_5],
    [Color.TEAL, Color.BLUE_6],
    [Color.DARK_PURPLE, Color.PURPLE],
    [Color.DARK_PINKLE, Color.PINKLE],
    [Color.PINKLE, Color.LIGHT_PINKLE],
    [Color.TAUPE_3, Color.TAN],
    [Color.TAUPE_2, Color.TAUPE_3],
    [Color.TAUPE_1, Color.TAUPE_2],
]

export class PlumePicker extends Component {
    position: Point = Point.ZERO // top-center position
    entity = new Entity([this])
    initialColor: number
    selected: number

    private renders: RenderMethod[]
    private readonly callback: (color: number) => void

    constructor(initialColor: number, callback: (color: number) => void) {
        super()
        this.initialColor = initialColor || 0
        this.callback = callback

        this.select(this.initialColor)
    }

    /**
     * Called when the user "cancels", to prevent overwriting the plume data
     */
    reset() {
        if (this.initialColor) {
            this.select(this.initialColor)
        }
    }

    getSelection() {
        return this.selected
    }

    select(colorIndex: number) {
        this.selected = colorIndex
        this.callback(colorIndex)
    }

    update() {
        const sqSize = TILE_SIZE
        const rowLen = 9
        const topLeftPos = this.position.plusX((-rowLen * sqSize) / 2)

        this.renders = PLUME_COLORS.map((colors, index) => {
            const position = topLeftPos
                .plusX((index % rowLen) * TILE_SIZE)
                .plusY(Math.floor(index / rowLen) * TILE_SIZE)
            const dimensions = new Point(TILE_SIZE, TILE_SIZE)

            const hovered = Maths.rectContains(position, dimensions, controls.getMousePos())
            const big = hovered || this.selected === index
            const bigBuffer = 2

            if (hovered && controls.isMenuClickDown()) {
                this.select(index)
            }

            return new RectRender({
                position: position.plus(big ? new Point(-bigBuffer, -bigBuffer) : Point.ZERO),
                dimensions: dimensions.plus(
                    big ? new Point(bigBuffer, bigBuffer).times(2) : Point.ZERO
                ),
                color: colors[1],
                depth: UIStateManager.UI_SPRITE_DEPTH + (big && !hovered ? 2 : hovered ? 1 : 0),
            })
        })
    }

    getRenderMethods(): RenderMethod[] {
        return this.renders
    }
}
