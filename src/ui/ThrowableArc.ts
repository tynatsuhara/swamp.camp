import { Component } from "brigsby/dist/Component"
import { Point } from "brigsby/dist/Point"
import { LineRender } from "brigsby/dist/renderer/LineRender"
import { ZOOM } from "../SwampCampGame"
import { Color } from "./Color"

// WIP

export class ThrowableArc extends Component {
    /**
     * @param a the leftmost point in world space
     * @param c the rightmost point in world space
     */
    constructor(a: Point, c: Point) {
        super()
        const horizontalDistance = c.x - a.x
        const verticalDistance = Math.abs(c.y - a.y)

        const midPointY = Math.min(a.y, c.y) - verticalDistance * 0.1
        const b = new Point(a.x + horizontalDistance / 2, midPointY)

        this.getRenderMethods = () => [
            new LineRender(a, b, Color.WHITE, ZOOM),
            new LineRender(b, c, Color.WHITE, ZOOM),
        ]
    }
}
