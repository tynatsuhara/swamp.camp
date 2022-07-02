import { Point } from "brigsby/lib"

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
