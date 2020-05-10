import { WorldLocation } from "../WorldLocation"
import { makeTree } from "./Tree"
import { makeRock } from "./Rock"
import { Point } from "../../../engine/point"
import { ElementComponent } from "./ElementComponent"
import { makeTent } from "./Tent"
import { makeCampfire } from "./Campfire"

// Elements are things which take up multiple squares in the non-ground ground
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
    * The functions should NOT explicitly add the entity to the given locations, the location should be read-only.
    * Instead, they should add the occupied points to the occupiedPoints array of the ElementComponent
    * @param pos the top-left corner of the element
    * @param args the element's metadata
    */
    private readonly ELEMENT_FUNCTION_MAP: { [key: number]: [(wl: WorldLocation, pos: Point, data: object) => ElementComponent , Point] } = {
       [ElementType.TREE]: [makeTree, new Point(1, 2)],
       [ElementType.ROCK]: [makeRock, new Point(1, 1)],
       [ElementType.TENT]: [makeTent, new Point(2, 2)],
       [ElementType.CAMPFIRE]: [makeCampfire, new Point(1, 1)]
   }

    make(type: ElementType, wl: WorldLocation, pos: Point, data: object) {
        return this.ELEMENT_FUNCTION_MAP[type][0](wl, pos, data)
    }

    dimensions(type: ElementType) {
        // TODO this is a pretty bad hack and will break if elements have dynamic sizing or if they try
        return this.ELEMENT_FUNCTION_MAP[type][1]
    }

    constructor() {
        Elements.instance = this
    }
}
