import { Point } from "brigsby/dist"
import { TILE_SIZE, pixelPtToTilePt } from "../../graphics/Tilesets"
import { TeleporterSound } from "../Teleporter"
import { ElementType } from "../elements/ElementType"
import { ElementUtils } from "../elements/ElementUtils"
import { FeatureData } from "../features/Features"
import { GroundType } from "../ground/Ground"
import { Location } from "../locations/Location"
import { LocationManager } from "../locations/LocationManager"

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
        interactablePos: Point,
        indicatorOffset?: Point,
        sound: TeleporterSound = "door"
    ) {
        const teleporterPos = interactablePos.plusY(-4)
        const teleporterId = l.uuid // use the interior's uuid as the teleporter ID

        LocationManager.instance.setTeleporter(
            teleporterId,
            "b",
            {
                location: l.uuid,
                pos: teleporterPos,
            },
            sound
        )

        l.addElement(ElementType.TELEPORTER_INDICATOR, pixelPtToTilePt(interactablePos), {
            teleporterId,
            i: interactablePos.toString(),
            offset: indicatorOffset,
        })
    },

    setWalkableTiles(l: Location, floorDimensions: Point) {
        ElementUtils.rectPoints(Point.ZERO, floorDimensions).forEach((p) =>
            l.setGroundElement(GroundType.BASIC, p)
        )
    },
}
