import { Point } from "../../../engine/point"
import { TILE_SIZE } from "../../graphics/Tilesets"
import { Barrier } from "../Barrier"

const BARRIER_WIDTH = 30
const PADDING = 2

export const InteriorUtils = {
    makeBarriers(tileDimensions: Point) {
        return [
            // left
            new Barrier(
                new Point(-BARRIER_WIDTH + PADDING, -BARRIER_WIDTH),
                new Point(BARRIER_WIDTH, tileDimensions.y * TILE_SIZE + 2 * BARRIER_WIDTH),
            ),
            // right
            new Barrier(
                new Point(tileDimensions.x * TILE_SIZE - PADDING, -BARRIER_WIDTH),
                new Point(BARRIER_WIDTH, tileDimensions.y * TILE_SIZE + 2 * BARRIER_WIDTH),
            ),
            // top
            new Barrier(
                new Point(-BARRIER_WIDTH, -BARRIER_WIDTH + PADDING),
                new Point(tileDimensions.x * TILE_SIZE + 2 * BARRIER_WIDTH, BARRIER_WIDTH),
            ),
            // bottom
            new Barrier(
                new Point(-BARRIER_WIDTH, tileDimensions.y * TILE_SIZE - PADDING),
                new Point(tileDimensions.x * TILE_SIZE + 2 * BARRIER_WIDTH, BARRIER_WIDTH),
            ),
        ]
    }
}