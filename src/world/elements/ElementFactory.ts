import { Point } from "brigsby/dist"
import { Location } from "../locations/Location"
import { ElementComponent } from "./ElementComponent"
import { ElementType } from "./Elements"

export abstract class ElementFactory<SaveFormat extends object = object> {
    abstract readonly type: ElementType

    /**
     * Free spaces that are required to place this element
     */
    abstract readonly dimensions: Point

    /**
     *
     * @param wl The location to which the element is being added. Implementations should NOT
     *           add the entity to the given locations, the location should be read-only.
     * @param pos The position of the element in tile coordinates (not pixel coordinates!)
     * @param data Previous save data (or an empty object)
     * @returns An ElementComponent with the factory's type, which MUST have a nonnull entity
     */
    abstract make(wl: Location, pos: Point, data: SaveFormat): ElementComponent<SaveFormat>

    /**
     * @param wl The location in which the user is trying to place an element
     */
    canPlaceInLocation(wl: Location) {
        return true
    }

    /**
     * @param pos The position of the element in tile coordinates (not pixel coordinates!)
     */
    canPlaceAtPos(wl: Location, pos: Point) {
        return true
    }
}
