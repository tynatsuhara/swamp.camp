import { Component, Entity, Point, pt } from "brigsby/dist"
import { RectRender, RenderMethod } from "brigsby/dist/renderer"
import { Maths } from "brigsby/dist/util"
import { controls } from "../core/Controls"
import { TILE_SIZE } from "../graphics/Tilesets"
import { ClickableUI } from "./ClickableUI"
import { Color } from "./Color"
import { UISounds } from "./UISounds"
import { UI_SPRITE_DEPTH } from "./UiConstants"

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

const SQ_SIZE = TILE_SIZE
const ROW_LENGTH = 9

export class PlumePicker extends Component {
    entity = new Entity([this])
    initialColor: number
    selected: number

    private renders: RenderMethod[]
    private readonly callback: (color: number) => void

    constructor(
        private readonly position,
        initialColor: number,
        callback: (color: number) => void
    ) {
        super()
        this.initialColor = initialColor || 0
        this.callback = callback

        this.select(this.initialColor)
    }

    awake() {
        PLUME_COLORS.forEach((_, index) => {
            const pos = this.getPositionForIndex(index).plus(pt(SQ_SIZE / 2))
            this.entity.addComponent(new ClickableUI(`plume-${index}`, pos))
        })
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
        this.renders = PLUME_COLORS.map((colors, index) => {
            const position = this.getPositionForIndex(index)
            const dimensions = new Point(TILE_SIZE, TILE_SIZE)

            const hovered = Maths.rectContains(position, dimensions, controls.getCursorPos())
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
                depth: UI_SPRITE_DEPTH + (big && !hovered ? 2 : hovered ? 1 : 0),
            })
        })
    }

    private getPositionForIndex(index: number) {
        const topLeftPos = this.position.plusX((-ROW_LENGTH * SQ_SIZE) / 2)
        return topLeftPos
            .plusX((index % ROW_LENGTH) * TILE_SIZE)
            .plusY(Math.floor(index / ROW_LENGTH) * TILE_SIZE)
    }

    getRenderMethods(): RenderMethod[] {
        return this.renders
    }
}
