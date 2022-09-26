import { Point } from "brigsby/dist"
import { ImageRender, LineRender } from "brigsby/dist/renderer"

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

export const showBoundingBox = (sprite: ImageRender): LineRender[] => {
    const { x: width, y: height } = sprite.dimensions
    return [
        [new Point(0, 0), new Point(width, 0)], // top
        [new Point(0, height), new Point(width, height)], // bottom
        [new Point(0, 0), new Point(0, height)], // left
        [new Point(width, 0), new Point(width, height)], // right
    ].map(([start, end]) => {
        return new LineRender(start.plus(sprite.position), end.plus(sprite.position))
    })
}
