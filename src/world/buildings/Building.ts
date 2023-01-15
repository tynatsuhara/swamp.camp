import { Point } from "brigsby/dist"
import { ElementFactory } from "../elements/ElementFactory"
import { ElementType } from "../elements/Elements"
import { ElementUtils } from "../elements/ElementUtils"
import { Ground } from "../ground/Ground"
import { Location } from "../locations/Location"
import { camp } from "../locations/LocationManager"

/**
 * At runtime, a building exterior is built with several components:
 *   1. Tiles, the visual component
 *   2. A collider
 *   3. A door teleporter
 * Data that is saved:
 *   1. Element type
 *   2. "Occupied points" which determines occupied squares in the world grid
 *   3. Misc metadata about the building
 *
 * TODO:
 *   - Add a "construction" process
 */
export abstract class BuildingFactory<
    Type extends ElementType,
    SaveFormat extends object = object
> extends ElementFactory<Type, SaveFormat> {
    canPlaceAtPos(wl: Location, pos: Point) {
        return ElementUtils.rectPoints(pos, this.dimensions)
            .map((pt) => wl.getGround(pt)?.type)
            .every((type) => Ground.isNaturalGround(type))
    }

    canPlaceInLocation(l: Location) {
        return l === camp()
    }
}
