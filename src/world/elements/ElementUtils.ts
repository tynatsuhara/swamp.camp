import { Point, pt } from "brigsby/dist"
import { PointValue } from "brigsby/dist/Point"

export const ElementUtils = {
    rectPoints: (position: PointValue, dimensions: Point): Point[] => {
        const result = []
        for (let x = 0; x < dimensions.x; x++) {
            for (let y = 0; y < dimensions.y; y++) {
                result.push(pt(position.x + x, position.y + y))
            }
        }
        return result
    },
}
