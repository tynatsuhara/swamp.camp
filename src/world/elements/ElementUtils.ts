import { Point } from "brigsby/dist/Point"

export const ElementUtils = {
    rectPoints: (position: Point, dimensions: Point): Point[] => {
        const result = []
        for (let x = 0; x < dimensions.x; x++) {
            for (let y = 0; y < dimensions.y; y++) {
                result.push(position.plus(new Point(x, y)))
            }
        }
        return result
    },
}
