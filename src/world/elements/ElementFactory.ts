import { ElementType } from "./Elements"
import { Point } from "brigsby/dist/Point"
import { ElementComponent } from "./ElementComponent"
import { WorldLocation } from "../WorldLocation"

export abstract class ElementFactory {

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
     * @param data Previous save data
     * @returns An ElementComponent with the factory's type, which MUST have a nonnull entity
     */
    abstract make(wl: WorldLocation, pos: Point, data: any): ElementComponent

    /**
     * @param wl The location in which the user is trying to place an element
     */
    canPlaceInLocation(wl: WorldLocation) {
        return true
    }

    /**
     * @param pos The position of the element in tile coordinates (not pixel coordinates!)
     */
    canPlaceAtPos(wl: WorldLocation, pos: Point) {
        return true
    }
}