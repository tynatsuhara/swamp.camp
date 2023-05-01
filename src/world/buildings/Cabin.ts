import { Point } from "brigsby/dist"
import { DudeType } from "../../characters/DudeType"
import { TILE_SIZE } from "../../graphics/Tilesets"
import { ElementType } from "../elements/ElementType"
import { BasicLocation } from "../locations/BasicLocation"
import { Location } from "../locations/Location"
import { LocationManager } from "../locations/LocationManager"
import { LocationType } from "../locations/LocationType"
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
    const l = new BasicLocation({
        type: LocationType.APOTHECARY_INTERIOR,
        isInterior: true,
        allowPlacing: false,
    })

    return LocationManager.instance.add(l)
}
