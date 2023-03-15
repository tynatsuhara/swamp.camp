import { Point } from "brigsby/dist"
import { DudeType } from "../../characters/DudeType"
import { TILE_SIZE } from "../../graphics/Tilesets"
import { ElementType } from "../elements/Elements"
import { Location, LocationImpl } from "../locations/Location"
import { LocationManager, LocationType } from "../locations/LocationManager"
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
    const l = new LocationImpl(LocationType.APOTHECARY_INTERIOR, true, false)

    return LocationManager.instance.add(l)
}
