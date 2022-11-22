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

export class CabinFactory extends SimpleBuildingFactory<ElementType.CABIN> {
    constructor() {
        super(
            ElementType.CABIN,
            new Point(5, 4),
            "cabin-small",
            makeCabinInterior,
            new Point(2, 1.5).times(TILE_SIZE),
            { [DudeType.VILLAGER]: 2 }
        )
    }
}

// TODO
const makeCabinInterior = (outside: Location): Location => {
    const l = new Location(LocationType.APOTHECARY_INTERIOR, true, false)

    const dimensions = new Point(4, 3)

    ElementUtils.rectPoints(Point.ZERO, dimensions).forEach((p) =>
        l.setGroundElement(GroundType.BASIC, p)
    )

    const interactablePos = new Point(1.5, 3).times(TILE_SIZE)
    InteriorUtils.addBarriers(l, dimensions)
    l.addTeleporter({
        to: outside.uuid,
        pos: interactablePos.plusY(-4),
        id: TeleporterPrefix.DOOR,
    })
    l.addElement(ElementType.TELEPORTER_INDICATOR, new Point(1, 3), {
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

    const skeletonPos = new Point(3, 1).times(TILE_SIZE)
    l.addFeature("sprite", {
        key: "skeleton",
        pixelX: skeletonPos.x,
        pixelY: skeletonPos.y,
        depth: skeletonPos.y + TILE_SIZE * 2 - 4,
    })

    // TODO: add counter collider..... this is annoying
    const counterPos = new Point(TILE_SIZE, 6)
    l.addFeature("sprite", {
        key: "dr-counter",
        pixelX: counterPos.x,
        pixelY: counterPos.y,
        depth: counterPos.y + TILE_SIZE,
    })

    return LocationManager.instance.add(l)
}
