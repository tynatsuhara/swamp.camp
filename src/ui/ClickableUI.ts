import { Component, debug, expose, Point, UpdateData } from "brigsby/dist"
import { EllipseRender } from "brigsby/dist/renderer/EllipseRender"
import { RenderMethod } from "brigsby/dist/renderer/RenderMethod"
import { Lists } from "brigsby/dist/util"
import { View } from "brigsby/dist/View"
import { controls } from "../Controls"

type Direction = "up" | "down" | "left" | "right"

export class ClickableUI extends Component {
    static currentMode: "cursor" | "dpad" = "dpad"

    private static hoveredUID: string
    private static hoveredHideCursor: boolean
    public static get hideCursor() {
        return !!ClickableUI.hoveredUID && ClickableUI.hoveredHideCursor
    }

    private canUpdate = true

    constructor(
        private readonly uid: string,
        private readonly cursorPos: Point,
        private readonly autofocus = false,
        private readonly showCursor = false
    ) {
        super()
    }

    private static getAllClickables(view: View) {
        return Object.fromEntries(
            view.entities.flatMap((e) => e.getComponents(ClickableUI)).map((c) => [c.uid, c])
        )
    }

    static select(clickable: ClickableUI) {
        ClickableUI.hoveredUID = clickable.uid
        ClickableUI.hoveredHideCursor = !clickable.showCursor
        controls.setGamepadCursorPosition(clickable.cursorPos)
    }

    /**
     * Must be called every frame by the cursor! (Kind of gross, but whatever)
     */
    static update(view: View) {
        // this ClickableUI isn't being rendered anymore
        if (
            ClickableUI.hoveredUID &&
            !(ClickableUI.hoveredUID in ClickableUI.getAllClickables(view))
        ) {
            ClickableUI.hoveredUID = undefined
        }

        expose({ hoveredClickable: this.hoveredUID, currentMode: this.currentMode })
    }

    /**
     * Update that only runs if there is at least 1 clickable thing on the screen
     */
    update({ view }: UpdateData) {
        // another clickable UI has already accepted input this frame
        if (!this.canUpdate) {
            return
        }

        // bail out of dpad mode
        if (controls.isCursorMoving()) {
            ClickableUI.hoveredUID = undefined
            ClickableUI.currentMode = "cursor"
            return
        }

        const allClickables = ClickableUI.getAllClickables(view)

        const directionalValues: Direction[] = ["up", "down", "left", "right"]
        const dpadDown = directionalValues.find((d) => controls.isDirectionButtonDown(d))
        if (dpadDown) {
            ClickableUI.currentMode = "dpad"
        }

        const select = (clickable: ClickableUI) => {
            if (clickable) {
                Object.values(allClickables).forEach((c) => (c.canUpdate = false))
                ClickableUI.select(clickable)
            }
        }

        if (dpadDown && (this.uid === ClickableUI.hoveredUID || !ClickableUI.hoveredUID)) {
            const clickableToSelect = this.getNextClickable(allClickables, dpadDown)

            select(clickableToSelect)
        } else if (!ClickableUI.hoveredUID && this.autofocus && ClickableUI.currentMode == "dpad") {
            select(this)
        } else if (this.uid === ClickableUI.hoveredUID) {
            select(this)
        }
    }

    private getNextClickable(allClickables: Record<string, ClickableUI>, dpadDown: Direction) {
        const cursorPos =
            allClickables[ClickableUI.hoveredUID]?.cursorPos ?? controls.getCursorPos()
        const clickableValues = Object.values(allClickables)

        const getClickable = (predicate: (c: ClickableUI) => void) =>
            Lists.minBy(clickableValues.filter(predicate), (c) => c.cursorPos.distanceTo(cursorPos))

        const clickable: ClickableUI = (() => {
            switch (dpadDown) {
                case "up":
                    return getClickable((c) => c.cursorPos.y < cursorPos.y)
                case "down":
                    return getClickable((c) => c.cursorPos.y > cursorPos.y)
                case "left":
                    return getClickable((c) => c.cursorPos.x < cursorPos.x)
                case "right":
                    return getClickable((c) => c.cursorPos.x > cursorPos.x)
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
