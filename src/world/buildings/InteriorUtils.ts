import { Point } from "brigsby/dist"
import { TILE_SIZE } from "../../graphics/Tilesets"
import { Barrier } from "../Barrier"
import { Location } from "../locations/Location"

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

    addBarriers(l: Location, tileDimensions: Point) {
        const verticalBarrier = {
            y: -BARRIER_WIDTH,
            width: BARRIER_WIDTH,
            height: tileDimensions.y * TILE_SIZE + 2 * BARRIER_WIDTH,
        }
        // left
        l.addFeature("barrier", {
            x: -BARRIER_WIDTH + SIDE_PADDING,
            ...verticalBarrier,
        })
        // right
        l.addFeature("barrier", {
            x: tileDimensions.x * TILE_SIZE - SIDE_PADDING,
            ...verticalBarrier,
        })
        const horizontalBarrier = {
            x: -BARRIER_WIDTH,
            width: tileDimensions.x * TILE_SIZE + 2 * BARRIER_WIDTH,
            height: BARRIER_WIDTH,
        }
        // top
        l.addFeature("barrier", {
            y: -BARRIER_WIDTH + TOP_BOT_PADDING,
            ...horizontalBarrier,
        })
        // bottom
        l.addFeature("barrier", {
            y: tileDimensions.y * TILE_SIZE - TOP_BOT_PADDING,
            ...horizontalBarrier,
        })
    },
}
