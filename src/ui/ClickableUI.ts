import { Component, debug, expose, GamepadButton, Point, UpdateData } from "brigsby/dist"
import { EllipseRender } from "brigsby/dist/renderer/EllipseRender"
import { RenderMethod } from "brigsby/dist/renderer/RenderMethod"
import { Lists } from "brigsby/dist/util"
import { View } from "brigsby/dist/View"
import { controls, DPadValue } from "../Controls"

export class ClickableUI extends Component {
    private static hoveredUID: string
    public static get isLockedOn() {
        return !!ClickableUI.hoveredUID
    }

    private canUpdate = true

    constructor(private readonly uid: string, private readonly cursorPos: Point) {
        super()
    }

    private static getAllClickables(view: View) {
        return Object.fromEntries(
            view.entities.flatMap((e) => e.getComponents(ClickableUI)).map((c) => [c.uid, c])
        )
    }

    static select(clickable: ClickableUI) {
        ClickableUI.hoveredUID = clickable.uid
        controls.setGamepadCursorPosition(clickable.cursorPos)
    }

    static update(view: View) {
        // this ClickableUI isn't being rendered anymore
        if (
            ClickableUI.hoveredUID &&
            !(ClickableUI.hoveredUID in ClickableUI.getAllClickables(view))
        ) {
            console.log("no more clickable")
            ClickableUI.hoveredUID = undefined
        }

        expose({ hoveredClickable: this.hoveredUID })
    }

    update({ view }: UpdateData) {
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

        const allClickables = ClickableUI.getAllClickables(view)

        // TODO Should we support this kind of navigation for keyboards too? arrow keys?
        //      It might make some of the "isGamepadMode" logic simpler and give a better load-in UX
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

    getRenderMethods(): RenderMethod[] {
        if (debug.showClickableUiPoints) {
            return [
                new EllipseRender({
                    depth: Number.MAX_SAFE_INTEGER,
                    position: this.cursorPos.plus(new Point(-2, -2)),
                    dimensions: new Point(4, 4),
                }),
            ]
        }
        return []
    }
}
