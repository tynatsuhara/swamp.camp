import { Point } from "brigsby/lib"
import { TILE_SIZE } from "../../graphics/Tilesets"
import { Barrier } from "../Barrier"

const BARRIER_WIDTH = 30
const SIDE_PADDING = 7
const TOP_BOT_PADDING = 3

export const InteriorUtils = {
    makeBarriers(tileDimensions: Point) {
        return [
            // left
            new Barrier(
                new Point(-BARRIER_WIDTH + SIDE_PADDING, -BARRIER_WIDTH),
                new Point(BARRIER_WIDTH, tileDimensions.y * TILE_SIZE + 2 * BARRIER_WIDTH)
            ),
            // right
            new Barrier(
                new Point(tileDimensions.x * TILE_SIZE - SIDE_PADDING, -BARRIER_WIDTH),
                new Point(BARRIER_WIDTH, tileDimensions.y * TILE_SIZE + 2 * BARRIER_WIDTH)
            ),
            // top
            new Barrier(
                new Point(-BARRIER_WIDTH, -BARRIER_WIDTH + TOP_BOT_PADDING),
                new Point(tileDimensions.x * TILE_SIZE + 2 * BARRIER_WIDTH, BARRIER_WIDTH)
            ),
            // bottom
            new Barrier(
                new Point(-BARRIER_WIDTH, tileDimensions.y * TILE_SIZE - TOP_BOT_PADDING),
                new Point(tileDimensions.x * TILE_SIZE + 2 * BARRIER_WIDTH, BARRIER_WIDTH)
            ),
        ]
    },
}
