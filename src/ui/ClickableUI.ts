import { Component, debug, GamepadButton, Point, UpdateData } from "brigsby/dist"
import { Lists } from "brigsby/dist/util"
import { controls, DPadValue } from "../Controls"

export class ClickableUI extends Component {
    private static hoveredUID: string

    private canUpdate = true

    constructor(private readonly uid: string, private readonly cursorPos: Point) {
        super()
    }

    static select(clickable: ClickableUI) {
        ClickableUI.hoveredUID = clickable.uid
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
            ClickableUI.hoveredUID = undefined
        }

        const allClickables = Object.fromEntries(
            view.entities.flatMap((e) => e.getComponents(ClickableUI)).map((c) => [c.uid, c])
        )

        // this ClickableUI isn't being rendered anymore
        if (ClickableUI.hoveredUID && !(ClickableUI.hoveredUID in allClickables)) {
            console.log("no more clickable")
            ClickableUI.hoveredUID = undefined
        }

        // TODO: Only apply once in a given frame
        const dpadValues: DPadValue[] = [
            GamepadButton.UP,
            GamepadButton.DOWN,
            GamepadButton.LEFT,
            GamepadButton.RIGHT,
        ]
        const dpadDown = dpadValues.find((d) => controls.isDPadDown(d))

        if (dpadDown && (this.uid === ClickableUI.hoveredUID || !ClickableUI.hoveredUID)) {
            const clickableToSelect =
                this.uid === ClickableUI.hoveredUID
                    ? this.getNextClickable(allClickables, dpadDown)
                    : this

            if (clickableToSelect) {
                Object.values(allClickables).forEach((c) => (c.canUpdate = false))
                ClickableUI.select(clickableToSelect)
            }
        }
    }

    private getNextClickable(allClickables: Record<string, ClickableUI>, dpadDown: DPadValue) {
        const { x, y } = allClickables[ClickableUI.hoveredUID]?.cursorPos ?? controls.getMousePos()
        const clickableValues = Object.values(allClickables)

        const getClickable = (predicate: (c: ClickableUI) => void) =>
            Lists.minBy(clickableValues.filter(predicate), (c) =>
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
