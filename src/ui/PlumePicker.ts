import { Component, Entity, Point } from "brigsby/dist"
import { RectRender, RenderMethod } from "brigsby/dist/renderer"
import { Maths } from "brigsby/dist/util"
import { controls } from "../Controls"
import { TILE_SIZE } from "../graphics/Tilesets"
import { Color } from "./Color"
import { UISounds } from "./UISounds"
import { UIStateManager } from "./UIStateManager"

// array of [dark, light] pairs
// TODO support new nanner colors
export const PLUME_COLORS: [Color, Color][] = [
    [Color.BLUE_1, Color.BLUE_2],
    [Color.BLUE_2, Color.BLUE_3],
    [Color.BLUE_3, Color.BLUE_4],
    [Color.BLUE_4, Color.BLUE_5],
    [Color.BLUE_5, Color.BLUE_6],

    [Color.GREEN_2, Color.GREEN_3],
    [Color.GREEN_3, Color.GREEN_4],
    [Color.GREEN_4, Color.GREEN_5],
    [Color.GREEN_5, Color.GREEN_6],

    [Color.RED_1, Color.RED_2],
    [Color.RED_2, Color.RED_3],
    [Color.RED_3, Color.RED_4],
    [Color.RED_4, Color.RED_5],
    [Color.RED_5, Color.RED_6],

    [Color.PINK_1, Color.PINK_2],
    [Color.PINK_2, Color.PINK_3],
    [Color.PINK_3, Color.PINK_4],
    [Color.PINK_4, Color.PINK_5],
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
                UISounds.playClickSound()
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
