import { Singletons } from "../../Singletons"
import { TeleporterFactory } from "../Teleporter"
import { BedFactory } from "./Bed"
import { CampfireFactory } from "./Campfire"
import { ChestFactory } from "./Chest"
import { ElementFactory } from "./ElementFactory"
import { HouseFactory } from "./House"
import { MineEntranceFactory } from "./MineEntrance"
import { MineExitFactory } from "./MineExit"
import { MushroomFactory } from "./Mushroom"
import { RockFactory } from "./Rock"
import { TentFactory } from "./Tent"
import { TreeFactory } from "./Tree"

// Elements are things which take up multiple squares in the non-ground ground
export enum ElementType {
    TREE_ROUND,
    TREE_POINTY,
    ROCK,
    TENT,
    CAMPFIRE,
    TELEPORTER,
    HOUSE,
    MUSHROOM,
    CHEST,
    BED,
    MINE_ENTRANCE,
    MINE_EXIT,
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
       [ElementType.CAMPFIRE]: new CampfireFactory(),
       [ElementType.TELEPORTER]: new TeleporterFactory(),
       [ElementType.MUSHROOM]: new MushroomFactory(),
       [ElementType.CHEST]: new ChestFactory(),
       [ElementType.BED]: new BedFactory(),
       [ElementType.TENT]: new TentFactory(),
       [ElementType.HOUSE]: new HouseFactory(),
       [ElementType.MINE_ENTRANCE]: new MineEntranceFactory(),
       [ElementType.MINE_EXIT]: new MineExitFactory(),
   }

   getElementFactory(type: ElementType) {
       return this.ELEMENT_FACTORIES[type]
   }
}
