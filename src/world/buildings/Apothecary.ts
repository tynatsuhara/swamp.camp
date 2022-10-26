import { Point } from "brigsby/dist"
import { DudeType } from "../../characters/DudeType"
import { TILE_SIZE } from "../../graphics/Tilesets"
import { ElementType } from "../elements/Elements"
import { ElementUtils } from "../elements/ElementUtils"
import { GroundType } from "../ground/Ground"
import { Location } from "../locations/Location"
import { LocationManager, LocationType } from "../locations/LocationManager"
import { TeleporterPrefix } from "../Teleporter"
import { InteriorUtils } from "./InteriorUtils"
import { SimpleBuildingFactory } from "./SimpleBuildingFactory"

export class ApothecaryFactory extends SimpleBuildingFactory {
    constructor() {
        super(
            ElementType.APOTHECARY,
            new Point(5, 4),
            "apothecary",
            makeApothecaryInterior,
            new Point(TILE_SIZE * 3, TILE_SIZE * 2),
            { [DudeType.DOCTOR]: 1 },
            -7
        )
    }
}

// TODO below

const makeApothecaryInterior = (outside: Location): Location => {
    const l = new Location(LocationType.APOTHECARY_INTERIOR, true, false)

    LocationManager.instance.add(l)
    const dimensions = new Point(5, 4)

    ElementUtils.rectPoints(Point.ZERO, dimensions).forEach((p) =>
        l.setGroundElement(GroundType.BASIC, p)
    )

    const interactablePos = new Point(1.5, dimensions.y).times(TILE_SIZE)
    InteriorUtils.addBarriers(l, dimensions)
    l.addTeleporter({
        to: outside.uuid,
        pos: interactablePos.plusY(-4),
        id: TeleporterPrefix.DOOR,
    })
    l.addElement(ElementType.TELEPORTER_INDICATOR, new Point(1, dimensions.y), {
        to: outside.uuid,
        i: interactablePos.toString(),
        id: TeleporterPrefix.DOOR,
    })

    l.addFeature("sprite", {
        key: "dr-interior",
        pixelX: 0,
        pixelY: -TILE_SIZE * 2,
        depth: Number.MIN_SAFE_INTEGER,
    })

    const skeletonPos = new Point(4, 2).times(TILE_SIZE)
    l.addFeature("sprite", {
        key: "skeleton",
        pixelX: skeletonPos.x,
        pixelY: skeletonPos.y,
        depth: skeletonPos.y + TILE_SIZE * 2 - 4,
    })

    const counterPos = new Point(TILE_SIZE * 2, 6)
    l.addFeature("sprite", {
        key: "dr-counter",
        pixelX: counterPos.x,
        pixelY: counterPos.y,
        depth: counterPos.y + TILE_SIZE,
    })
    l.addFeature("navMeshCollider", {
        x: counterPos.x + 5,
        y: counterPos.y + 10,
        width: 2.5 * TILE_SIZE,
        height: 5,
    })

    return l
}
