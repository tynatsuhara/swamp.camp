import { WorldLocation } from "../WorldLocation"
import { makeTree } from "./Tree"
import { makeRock } from "./Rock"
import { Point } from "../../../engine/point"
import { ElementComponent } from "./ElementComponent"
import { makeTent } from "./Tent"
import { makeCampfire } from "./Campfire"

export const enum ElementType {
    TREE,
    ROCK,
    TENT,
    CAMPFIRE
}

export class SavedElement {
    pos: string
    type: ElementType
    obj: object
}

export class Elements {
    static instance: Elements

    /**
    * Each of these functions should return an ElementComponent with a nonnull entity
    * The functions should NOT explicitly add the entity to the given locations
    * Instead, they should add the occupied points to the occupiedPoints array of the ElementComponent
    * @param pos the top-left corner of the element
    * @param args the element's metadata
    */
    private readonly ELEMENT_FUNCTION_MAP: { [key: number]: (wl: WorldLocation, pos: Point, data: object) => ElementComponent } = {
       [ElementType.TREE]: makeTree,
       [ElementType.ROCK]: makeRock,
       [ElementType.TENT]: makeTent,
       [ElementType.CAMPFIRE]: makeCampfire
   }

    make(type: ElementType, wl: WorldLocation, pos: Point, data: object) {
        return this.ELEMENT_FUNCTION_MAP[type](wl, pos, data)
    }

    constructor() {
        Elements.instance = this
    }
}
