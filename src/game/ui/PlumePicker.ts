import { Component } from "../../engine/Component"
import { UpdateData } from "../../engine/Engine"
import { Entity } from "../../engine/Entity"
import { Point } from "../../engine/Point"
import { RectRender } from "../../engine/renderer/RectRender"
import { RenderMethod } from "../../engine/renderer/RenderMethod"
import { rectContains } from "../../engine/util/Utils"
import { TILE_SIZE } from "../graphics/Tilesets"
import { Color } from "./Color"
import { UIStateManager } from "./UIStateManager"

// array of [dark, light] pairs
const CUSTOMIZATION_OPTIONS = [
    [Color.DARK_DARK_PINK, Color.DARK_PINK],
    [Color.DARK_PINK, Color.PINK],
    [Color.PINK, Color.LIGHT_PINK],
    [Color.DARK_RED, Color.RED],
    [Color.DARK_ORANGE, Color.ORANGE],
    [Color.ORANGE, Color.LIGHT_ORANGE],
    [Color.LIGHT_ORANGE, Color.YELLOW],
    [Color.GREEN, Color.LIME],
    [Color.DARK_GREEN, Color.GREEN],
    [Color.DARK_DARK_BLUE, Color.DARK_BLUE],
    [Color.DARK_BLUE, Color.LIGHT_BLUE],
    [Color.TEAL, Color.BRIGHT_BLUE],
    [Color.DARK_PURPLE, Color.PURPLE],
    [Color.DARK_PINKLE, Color.PINKLE],
    [Color.PINKLE, Color.LIGHT_PINKLE],
    [Color.LIGHT_BROWN, Color.TAN],
    [Color.BROWN, Color.LIGHT_BROWN],
    [Color.DARK_BROWN, Color.BROWN],
]

export class PlumePicker extends Component {

    position: Point = Point.ZERO  // top-center position
    entity = new Entity([this])
    initialColor: Color[]
    selected: Color[]

    private renders: RenderMethod[]
    private readonly callback: (color: Color[]) => void

    constructor(initialColor: Color[], callback: (color: Color[]) => void) {
        super()
        this.callback = callback
        
        if (initialColor) {
            this.select(this.initialColor)
        } else {
            this.select([Color.PINK, Color.LIGHT_PINK])
        }
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

    private select(colors: Color[]) {
        this.selected = colors
        this.callback(colors)
    }

    update(updateData: UpdateData) {
        const sqSize = TILE_SIZE
        const rowLen = 9
        const topLeftPos = this.position.plusX(-rowLen * sqSize / 2)

        this.renders = CUSTOMIZATION_OPTIONS.map((colors, index) => {
            const position = topLeftPos.plusX((index % rowLen) * TILE_SIZE)
                                       .plusY(Math.floor(index/rowLen) * TILE_SIZE)
            const dimensions = new Point(TILE_SIZE, TILE_SIZE)

            const hovered = rectContains(position, dimensions, updateData.input.mousePos)
            const big = hovered || JSON.stringify(colors) == JSON.stringify(this.selected)
            const bigBuffer = 2

            if (hovered && updateData.input.isMouseDown) {
                this.select(colors)
            }
            
            return new RectRender({
                position: position.plus(big ? new Point(-bigBuffer, -bigBuffer) : Point.ZERO),
                dimensions: dimensions.plus(big ? new Point(bigBuffer, bigBuffer).times(2) : Point.ZERO),
                color: colors[1],
                depth: UIStateManager.UI_SPRITE_DEPTH + (big && !hovered ? 2 : hovered ? 1 : 0)
            })
        })
    }

    getRenderMethods(): RenderMethod[] {
        return this.renders
    }
}