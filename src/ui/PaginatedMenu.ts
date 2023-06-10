import { Component, Point, pt } from "brigsby/dist"
import { BasicRenderComponent } from "brigsby/dist/renderer"
import { Maths } from "brigsby/dist/util"
import { controls } from "../core/Controls"
import { TILE_SIZE } from "../graphics/Tilesets"
import { ClickableUI } from "./ClickableUI"
import { Color } from "./Color"
import { getIconSpriteImageRender } from "./IconSprite"
import { TextAlign, formatText } from "./Text"

const COLOR_TEXT_HOVERED = Color.WHITE
const COLOR_TEXT_NOT_HOVERED = Color.PINK_3
const COLOR_LACKING_INGREDIENT = Color.RED_1

export abstract class PaginatedMenu extends Component {
    page: number = 0
    abstract get pages(): number

    renderPageSelection(topLeft: Point, dimensions: Point) {
        const buttonOffsetX = 14
        const buttonOffsetY = 16
        const pageLeftButtonCenterPos = topLeft
            .plus(pt(buttonOffsetX, dimensions.y - buttonOffsetY))
            .apply(Math.floor)
        const pageRightButtonCenterPos = topLeft
            .plus(pt(dimensions.x - buttonOffsetX, dimensions.y - buttonOffsetY))
            .apply(Math.floor)

        return [
            new BasicRenderComponent(
                ...formatText({
                    text: `${this.page + 1}/${this.pages}`,
                    position: topLeft.plusY(dimensions.y - 19),
                    width: dimensions.x,
                    alignment: TextAlign.CENTER,
                    color: COLOR_TEXT_NOT_HOVERED,
                })
            ),
            ...this.renderPageButton(pageLeftButtonCenterPos, this.page > 0, "left"),
            ...this.renderPageButton(pageRightButtonCenterPos, this.page < this.pages - 1, "right"),
        ]
    }

    private renderPageButton(
        centerPos: Point,
        active: boolean,
        key: "left" | "right"
    ): Component[] {
        const isHovering = Maths.rectContains(
            centerPos.minus(pt(TILE_SIZE / 2)),
            pt(TILE_SIZE),
            controls.getCursorPos()
        )
        const activeColor = isHovering ? COLOR_TEXT_HOVERED : COLOR_TEXT_NOT_HOVERED
        const render = getIconSpriteImageRender({
            icon: `small_arrow_${key}`,
            centerPos,
            color: active ? activeColor : COLOR_LACKING_INGREDIENT,
        })
        if (controls.isMenuClickDown() && isHovering && active) {
            this.selectPage(key === "left" ? this.page - 1 : this.page + 1)
        }
        return [
            new BasicRenderComponent(render),
            new ClickableUI(`craft-${key}`, centerPos, false, true),
        ]
    }

    selectPage(page: number) {
        this.page = page
    }
}
