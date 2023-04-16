import { Component, debug, GamepadButton, Point, UpdateData } from "brigsby/dist"
import { Lists } from "brigsby/dist/util"
import { controls, DPadValue } from "../Controls"

export class ClickableUI extends Component {
    private static hovered: ClickableUI

    private readonly cursorPos: Point
    private readonly showCursorInGamepadMode: boolean
    private canUpdate = true

    constructor(cursorPos: Point, showCursorInGamepadMode: boolean) {
        super()
        this.cursorPos = cursorPos
        this.showCursorInGamepadMode = showCursorInGamepadMode
    }

    static select(clickable: ClickableUI) {
        ClickableUI.hovered = clickable
        controls.setGamepadCursorPosition(clickable.cursorPos)
    }

    update({ view, tick }: UpdateData) {
        // TODO remove debug flag once this is ready
        if (!debug.dpadMenus) {
            return
        }

        // another clickable UI has already accepted input this frame
        if (!this.canUpdate || !controls.isGamepadMode()) {
            return
        }

        if (controls.isRightStickMoving()) {
            ClickableUI.hovered = undefined
        }

        // TODO: Only apply once in a given frame
        const dpadValues: DPadValue[] = [
            GamepadButton.UP,
            GamepadButton.DOWN,
            GamepadButton.LEFT,
            GamepadButton.RIGHT,
        ]
        const dpadDown = dpadValues.find((d) => controls.isDPadDown(d))

        if (dpadDown && (this === ClickableUI.hovered || !ClickableUI.hovered)) {
            const allClickables = view.entities.flatMap((e) => e.getComponents(ClickableUI))

            // this ClickableUI isn't being rendered anymore
            if (ClickableUI.hovered && !allClickables.includes(ClickableUI.hovered)) {
                console.log("no more clickable")
                ClickableUI.hovered = undefined
            }

            const clickableToSelect =
                this === ClickableUI.hovered ? this.getNextClickable(allClickables, dpadDown) : this

            if (clickableToSelect) {
                allClickables.forEach((c) => (c.canUpdate = false))
                ClickableUI.select(clickableToSelect)
            }
        }
    }

    private getNextClickable(allClickables: ClickableUI[], dpadDown: DPadValue) {
        const { x, y } = ClickableUI.hovered?.cursorPos ?? controls.getMousePos()

        const getClickable = (predicate: (c: ClickableUI) => void) =>
            Lists.minBy(allClickables.filter(predicate), (c) =>
                c.cursorPos.distanceTo(this.cursorPos)
            )

        // TODO improve selection logic
        const clickable: ClickableUI = (() => {
            switch (dpadDown) {
                case GamepadButton.UP:
                    return getClickable((c) => c.cursorPos.y < y)
                case GamepadButton.DOWN:
                    return getClickable((c) => c.cursorPos.y > y)
                case GamepadButton.LEFT:
                    return getClickable((c) => c.cursorPos.x < x)
                case GamepadButton.RIGHT:
                    return getClickable((c) => c.cursorPos.x > x)
            }
        })()

        return clickable
    }

    lateUpdate() {
        this.canUpdate = true
    }
}
