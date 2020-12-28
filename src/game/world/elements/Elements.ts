import { TeleporterFactory } from "../Teleporter"
import { CampfireFactory } from "./Campfire"
import { ElementFactory } from "./ElementFactory"
import { HouseFactory } from "./House"
import { RockFactory } from "./Rock"
import { TentFactory } from "./Tent"
import { TreeFactory } from "./Tree"

// Elements are things which take up multiple squares in the non-ground ground
export const enum ElementType {
    TREE_ROUND,
    TREE_POINTY,
    ROCK,
    TENT,
    CAMPFIRE,
    TELEPORTER,
    HOUSE
}

export class SavedElement {
    pos: string
    type: ElementType
    obj: object
}

export class Elements {

    private static _instance: Elements
    static get instance(): Elements {
        if (!this._instance) {
            this._instance = new Elements()
        }
        return this._instance
    }

    private constructor() {
        Elements._instance = this
    }

    /*
    * Tuples of [makeFunction, dimensionsForPlacing]
    * Each of these functions should return an ElementComponent with a nonnull entity
    * The functions should NOT explicitly add the entity to the given locations, the location should be read-only.
    * Instead, they should add the occupied points to the occupiedPoints array of the ElementComponent
    * @param pos the top-left corner of the element
    * @param args the element's metadata
    */
    private readonly ELEMENT_FACTORIES: { [key: number]: ElementFactory } = {
       [ElementType.TREE_ROUND]: new TreeFactory(ElementType.TREE_ROUND),
       [ElementType.TREE_POINTY]: new TreeFactory(ElementType.TREE_POINTY),
       [ElementType.ROCK]: new RockFactory(),
       [ElementType.TENT]: new TentFactory(),
       [ElementType.CAMPFIRE]: new CampfireFactory(),
       [ElementType.TELEPORTER]: new TeleporterFactory(),
       [ElementType.HOUSE]: new HouseFactory(),
   }

   getElementFactory(type: ElementType) {
       return this.ELEMENT_FACTORIES[type]
   }
}
