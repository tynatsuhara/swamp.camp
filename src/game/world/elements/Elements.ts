import { Singletons } from "../../Singletons"
import { TeleporterFactory } from "../Teleporter"
import { BedFactory } from "./Bed"
import { CampfireFactory } from "./Campfire"
import { ChestFactory } from "./Chest"
import { ElementFactory } from "./ElementFactory"
import { HouseFactory } from "./House"
import { MushroomFactory } from "./Mushroom"
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
    HOUSE,
    MUSHROOM,
    CHEST,
    BED
}

export class SavedElement {
    pos: string
    type: ElementType
    obj: object
}

export class Elements {

    static get instance() {
        return Singletons.getOrCreate(Elements)
    }

    private readonly ELEMENT_FACTORIES: { [key: number]: ElementFactory } = {
       [ElementType.TREE_ROUND]: new TreeFactory(ElementType.TREE_ROUND),
       [ElementType.TREE_POINTY]: new TreeFactory(ElementType.TREE_POINTY),
       [ElementType.ROCK]: new RockFactory(),
       [ElementType.TENT]: new TentFactory(),
       [ElementType.CAMPFIRE]: new CampfireFactory(),
       [ElementType.TELEPORTER]: new TeleporterFactory(),
       [ElementType.HOUSE]: new HouseFactory(),
       [ElementType.MUSHROOM]: new MushroomFactory(),
       [ElementType.CHEST]: new ChestFactory(),
       [ElementType.BED]: new BedFactory(),
   }

   getElementFactory(type: ElementType) {
       return this.ELEMENT_FACTORIES[type]
   }
}
