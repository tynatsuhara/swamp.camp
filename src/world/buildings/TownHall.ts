import { Point, pt } from "brigsby/dist"
import { DudeType } from "../../characters/DudeType"
import { TILE_SIZE } from "../../graphics/Tilesets"
import { ElementType } from "../elements/ElementType"
import { BasicLocation } from "../locations/BasicLocation"
import { Location } from "../locations/Location"
import { LocationManager } from "../locations/LocationManager"
import { LocationType } from "../locations/LocationType"
import { InteriorUtils } from "./InteriorUtils"
import { SimpleBuildingFactory } from "./SimpleBuildingFactory"

// TODO various sizes of town hall

export class TownHallFactory extends SimpleBuildingFactory<ElementType.TOWN_HALL> {
    constructor() {
        super(
            ElementType.TOWN_HALL,
            new Point(5, 4),
            "town-hall",
            makeTownHallInterior,
            new Point(3, 2).times(TILE_SIZE),
            { [DudeType.HERALD]: 1 } // TODO?
        )
    }
}

const makeTownHallInterior = (outside: Location): Location => {
    const l = new BasicLocation({
        type: LocationType.APOTHECARY_INTERIOR,
        isInterior: true,
        allowPlacing: false,
    })

    const dimensions = new Point(5, 4)
    InteriorUtils.setWalkableTiles(l, dimensions)
    InteriorUtils.addBarriers(l, dimensions)

    l.addFeature("sprite", {
        key: "town-hall-interior",
        pixelX: 0,
        pixelY: -TILE_SIZE * 2, // offset for wall
        depth: Number.MIN_SAFE_INTEGER,
    })

    l.addFeature("navMeshCollider", {
        x: 0,
        y: 0,
        width: TILE_SIZE * dimensions.x,
        height: TILE_SIZE,
    })

    l.addElement(ElementType.CHEST, pt(0, 0), { id: "shared" }) // TODO figure out food chest mechanics

    const interactablePos = new Point(2.5, dimensions.y).times(TILE_SIZE)
    InteriorUtils.addTeleporter(l, interactablePos)

    return LocationManager.instance.add(l)
}
