import { Point } from "brigsby/dist"
import { EllipseRender, ImageRender, LineRender, RenderMethod } from "brigsby/dist/renderer"

export const tilesAround = (center: Point, radius: number = 1): Point[] => {
    let result = []

    for (let x = -radius; x <= radius; x++) {
        for (let y = -radius; y <= radius; y++) {
            if (x !== 0 || y !== 0) {
                result.push(new Point(center.x + x, center.y + y))
            }
        }
    }

    return result
}

export const showBoundingBox = (sprite: ImageRender): RenderMethod[] => {
    const { x: width, y: height } = sprite.dimensions
    const center = new EllipseRender({
        depth: Number.MAX_SAFE_INTEGER,
        position: sprite.position.plus(sprite.dimensions.div(2)).minus(new Point(0.5, 0.5)),
        dimensions: new Point(1, 1),
        color: "#FF0000",
    })
    const lines = [
        [new Point(0, 0), new Point(width, 0)], // top
        [new Point(0, height), new Point(width, height)], // bottom
        [new Point(0, 0), new Point(0, height)], // left
        [new Point(width, 0), new Point(width, height)], // right
    ].map(([start, end]) => {
        return new LineRender(start.plus(sprite.position), end.plus(sprite.position), "#00FF00")
    })
    return [center, ...lines]
}
