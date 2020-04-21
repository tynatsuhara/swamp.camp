import { Point } from "../point"

export function rectContains(rectPosition: Point, rectDimensions: Point, pt: Point): boolean {
    return pt.x >= rectPosition.x && pt.x < rectPosition.x + rectDimensions.x
                && pt.y >= rectPosition.y && pt.y < rectPosition.y + rectDimensions.y
}