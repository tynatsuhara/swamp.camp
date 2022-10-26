import { Point } from "brigsby/dist"
import { ItemMetadata } from "../../items/Items"
import { Location } from "../locations/Location"
import { ElementComponent } from "./ElementComponent"
import { ElementType } from "./Elements"

export abstract class ElementFactory<Type extends ElementType, SaveFormat extends object = object> {
    readonly type: Type

    constructor(type: Type) {
        this.type = type
    }

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
    abstract make(
        wl: Location,
        pos: Point,
        data: Partial<SaveFormat>
    ): ElementComponent<Type, SaveFormat>

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

    itemMetadataToSaveFormat(metadata: ItemMetadata): SaveFormat {
        // factories should override if they can be instantiated
        // from an item and depend on unique item metadata
        return undefined
    }
}
