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
