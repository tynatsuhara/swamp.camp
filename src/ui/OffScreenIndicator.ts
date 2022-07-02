import { Component, Point, UpdateData } from "brigsby/lib"
import { ImageRender } from "brigsby/lib/renderer"
import { SpriteTransform } from "brigsby/lib/sprites"
import { Lists, Maths } from "brigsby/lib/util"
import { Camera } from "../cutscenes/Camera"
import { Tilesets, TILE_SIZE } from "../graphics/Tilesets"

export class OffScreenIndicator extends Component {
    private markerDistFromEdge = 13
    private tileSource: string
    private tilePoint: Point
    private positionSupplier: () => Point

    constructor(positionSupplier: () => Point) {
        super()
        this.positionSupplier = positionSupplier
    }

    update(updateData: UpdateData) {
        const cameraPos = Camera.instance.position
        const cameraDimensions = updateData.dimensions

        const point = this.positionSupplier()

        if (Maths.rectContains(cameraPos, cameraDimensions, point)) {
            this.tileSource = null
            return
        }

        const intersect = this.cameraEdgeIntersectPoint(point, cameraPos, cameraDimensions)
        this.tilePoint = intersect[1]
            .minus(cameraPos) // offset since this is in the UI view
            .minus(new Point(0.5, 0.5).times(TILE_SIZE))
        this.tileSource = `arrow_${intersect[0]}_2`
    }

    getRenderMethods(): ImageRender[] {
        if (!this.tileSource) return []
        return [
            Tilesets.instance.oneBit
                .getTileSource(this.tileSource)
                .toImageRender(new SpriteTransform(this.tilePoint)),
        ]
    }

    private cameraEdgeIntersectPoint(
        outsidePoint: Point,
        cameraPos: Point,
        cameraDimensions: Point
    ): [string, Point] {
        cameraPos = cameraPos.plus(new Point(1, 1).times(this.markerDistFromEdge))
        cameraDimensions = cameraDimensions.minus(new Point(2, 2).times(this.markerDistFromEdge))

        const midpoint = cameraPos.plus(cameraDimensions.div(2))
        const pts: [string, Point][] = []
        if (outsidePoint.y < cameraPos.y) {
            // top
            pts.push([
                "up",
                this.lineIntersectPoint(
                    midpoint,
                    outsidePoint,
                    cameraPos,
                    cameraPos.plusX(cameraDimensions.x)
                ),
            ])
        } else if (outsidePoint.y > cameraPos.y + cameraDimensions.y) {
            // bottom
            pts.push([
                "down",
                this.lineIntersectPoint(
                    midpoint,
                    outsidePoint,
                    cameraPos.plusY(cameraDimensions.y),
                    cameraPos.plus(cameraDimensions)
                ),
            ])
        }
        if (outsidePoint.x < cameraPos.x) {
            // left
            pts.push([
                "left",
                this.lineIntersectPoint(
                    midpoint,
                    outsidePoint,
                    cameraPos,
                    cameraPos.plusY(cameraDimensions.y)
                ),
            ])
        } else if (outsidePoint.x > cameraPos.x + cameraDimensions.x) {
            // right
            pts.push([
                "right",
                this.lineIntersectPoint(
                    midpoint,
                    outsidePoint,
                    cameraPos.plusX(cameraDimensions.x),
                    cameraPos.plus(cameraDimensions)
                ),
            ])
        }
        return Lists.minBy(pts, (pt) => pt[1].distanceTo(midpoint))
    }

    // taken from https://gamedev.stackexchange.com/questions/111100/intersection-of-a-line-and-a-rectangle
    private lineIntersectPoint(ps1: Point, pe1: Point, ps2: Point, pe2: Point): Point {
        // Get A,B of first line - points : ps1 to pe1
        const A1 = pe1.y - ps1.y
        const B1 = ps1.x - pe1.x
        // Get A,B of second line - points : ps2 to pe2
        const A2 = pe2.y - ps2.y
        const B2 = ps2.x - pe2.x

        // Get delta and check if the lines are parallel
        const delta = A1 * B2 - A2 * B1
        if (delta === 0) {
            return null
        }

        // Get C of first and second lines
        const C2 = A2 * ps2.x + B2 * ps2.y
        const C1 = A1 * ps1.x + B1 * ps1.y
        // invert delta to make division cheaper
        const invdelta = 1 / delta
        // now return the Vector2 intersection point
        return new Point((B2 * C1 - B1 * C2) * invdelta, (A1 * C2 - A2 * C1) * invdelta)
    }
}
