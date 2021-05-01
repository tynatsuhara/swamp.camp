import { ElementType } from "./Elements"
import { Point } from "../../../engine/Point"
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
    abstract make(wl: WorldLocation, pos: Point, data: object): ElementComponent

    /**
     * @param pos The position of the element in tile coordinates (not pixel coordinates!)
     */
    canPlace(pos: Point) {
        return true
    }
}