import { Point } from "brigsby/dist"
import { TILE_SIZE, pixelPtToTilePt } from "../../graphics/Tilesets"
import { TeleporterPrefix } from "../Teleporter"
import { ElementType } from "../elements/ElementType"
import { FeatureData } from "../features/Features"
import { Location } from "../locations/Location"

const BARRIER_WIDTH = 30
const SIDE_PADDING = 7
const TOP_BOT_PADDING = 3

export const InteriorUtils = {
    addBarriers(l: Location, tileDimensions: Point) {
        const verticalBarrier = {
            y: -BARRIER_WIDTH,
            width: BARRIER_WIDTH,
            height: tileDimensions.y * TILE_SIZE + 2 * BARRIER_WIDTH,
        }
        const horizontalBarrier = {
            x: -BARRIER_WIDTH,
            width: tileDimensions.x * TILE_SIZE + 2 * BARRIER_WIDTH,
            height: BARRIER_WIDTH,
        }
        const left = { x: -BARRIER_WIDTH + SIDE_PADDING, ...verticalBarrier }
        const right = { x: tileDimensions.x * TILE_SIZE - SIDE_PADDING, ...verticalBarrier }
        const top = { y: -BARRIER_WIDTH + TOP_BOT_PADDING, ...horizontalBarrier }
        const bottom = { y: tileDimensions.y * TILE_SIZE - TOP_BOT_PADDING, ...horizontalBarrier }
        const barriers: FeatureData<"barrier">[] = [left, right, top, bottom]
        barriers.forEach((b) => l.addFeature("barrier", b))
    },

    addTeleporter(
        l: Location,
        outside: Location,
        interactablePos: Point,
        indicatorOffset?: Point,
        id = TeleporterPrefix.DOOR
    ) {
        l.addTeleporter({
            to: outside.uuid,
            pos: interactablePos.plusY(-4),
            id,
        })
        l.addElement(ElementType.TELEPORTER_INDICATOR, pixelPtToTilePt(interactablePos), {
            to: outside.uuid,
            i: interactablePos.toString(),
            id,
            offset: indicatorOffset,
        })
    },
}
