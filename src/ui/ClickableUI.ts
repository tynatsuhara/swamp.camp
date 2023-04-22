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
    public static get isActive() {
        return !!ClickableUI.hoveredUID
    }
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

        if (!ClickableUI.hoveredUID && ClickableUI.currentMode == "dpad") {
            const autofocus = Object.values(ClickableUI.getAllClickables(view)).find(
                (c) => c.autofocus
            )
            if (autofocus) {
                ClickableUI.select(autofocus)
            }
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
        } else if (this.uid === ClickableUI.hoveredUID) {
            select(this)
        }
    }

    // TODO: Add looping (furthest right -> furthest left, etc)
    private getNextClickable(allClickables: Record<string, ClickableUI>, dpadDown: Direction) {
        const cursorPos =
            allClickables[ClickableUI.hoveredUID]?.cursorPos ?? controls.getCursorPos()
        const clickableValues = Object.values(allClickables)

        const getClickable = (directionPredicate: (c: ClickableUI) => void, vertical: boolean) => {
            // finds things that are in roughly the same row/column
            const channelPredicate = (c: ClickableUI) => {
                const yDiff = Math.abs(cursorPos.y - c.cursorPos.y)
                const xDiff = Math.abs(cursorPos.x - c.cursorPos.x)
                return (vertical ? xDiff : yDiff) < 10
            }
            return (
                Lists.minBy(
                    clickableValues.filter((c) => channelPredicate(c) && directionPredicate(c)),
                    (c) => c.cursorPos.distanceTo(cursorPos)
                ) ||
                // Find anything in that direction
                Lists.minBy(
                    clickableValues.filter((c) => directionPredicate(c)),
                    (c) => c.cursorPos.distanceTo(cursorPos)
                )
            )
        }

        const clickable: ClickableUI = (() => {
            switch (dpadDown) {
                case "up":
                    return getClickable((c) => c.cursorPos.y < cursorPos.y, true)
                case "down":
                    return getClickable((c) => c.cursorPos.y > cursorPos.y, true)
                case "left":
                    return getClickable((c) => c.cursorPos.x < cursorPos.x, false)
                case "right":
                    return getClickable((c) => c.cursorPos.x > cursorPos.x, false)
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
