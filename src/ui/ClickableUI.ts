import { Component, debug, expose, Point, UpdateData } from "brigsby/dist"
import { EllipseRender } from "brigsby/dist/renderer/EllipseRender"
import { RenderMethod } from "brigsby/dist/renderer/RenderMethod"
import { Lists } from "brigsby/dist/util"
import { View } from "brigsby/dist/View"
import { controls } from "../Controls"

type Direction = "up" | "down" | "left" | "right"

export class ClickableUI extends Component {
    private static hoveredUID: string
    public static get isLockedOn() {
        return !!ClickableUI.hoveredUID
    }

    private canUpdate = true

    constructor(
        private readonly uid: string,
        private readonly cursorPos: Point,
        private readonly autofocus: boolean = false // TODO
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
        if (!this.canUpdate) {
            return
        }

        // bail out of dpad mode
        if (controls.isCursorMoving()) {
            ClickableUI.hoveredUID = undefined
            return
        }

        const allClickables = ClickableUI.getAllClickables(view)

        const directionalValues: Direction[] = ["up", "down", "left", "right"]
        const dpadDown = directionalValues.find((d) => controls.isDirectionButtonDown(d))

        const select = (clickable: ClickableUI) => {
            if (clickable) {
                Object.values(allClickables).forEach((c) => (c.canUpdate = false))
                ClickableUI.select(clickable)
            }
        }

        if (dpadDown && (this.uid === ClickableUI.hoveredUID || !ClickableUI.hoveredUID)) {
            const clickableToSelect =
                this.uid === ClickableUI.hoveredUID
                    ? this.getNextClickable(allClickables, dpadDown)
                    : this

            select(clickableToSelect)
        } else if (!ClickableUI.hoveredUID) {
            // const autofocusClickable = Object.values(allClickables).find((c) => c.autofocus)
            // select(autofocusClickable)
        } else if (this.uid === ClickableUI.hoveredUID) {
            // select(this)
        }
    }

    private getNextClickable(allClickables: Record<string, ClickableUI>, dpadDown: Direction) {
        const { x, y } = allClickables[ClickableUI.hoveredUID]?.cursorPos ?? controls.getCursorPos()
        const clickableValues = Object.values(allClickables)

        const getClickable = (predicate: (c: ClickableUI) => void) =>
            Lists.minBy(clickableValues.filter(predicate), (c) =>
                c.cursorPos.distanceTo(this.cursorPos)
            )

        const clickable: ClickableUI = (() => {
            switch (dpadDown) {
                case "up":
                    return getClickable((c) => c.cursorPos.y < y)
                case "down":
                    return getClickable((c) => c.cursorPos.y > y)
                case "left":
                    return getClickable((c) => c.cursorPos.x < x)
                case "right":
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
