import { Point } from "brigsby/dist"
import { ElementComponent } from "../elements/ElementComponent"
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

    /**
     * Internal wrapped implementation for
     */
    abstract makeBuilding(
        wl: Location,
        pos: Point,
        data: Partial<SaveFormat>
    ): ElementComponent<Type, SaveFormat>

    /**
     * readonly to prevent overriding by subclasses
     */
    readonly make = (
        wl: Location,
        pos: Point,
        data: Partial<SaveFormat>
    ): ElementComponent<Type, SaveFormat> => {
        // TODO: Add construction process

        return this.makeBuilding(wl, pos, data)
    }
}
