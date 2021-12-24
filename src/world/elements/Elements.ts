import { Singletons } from "../../Singletons"
import { ChurchFactory } from "../buildings/Church"
import { HouseFactory } from "../buildings/House"
import { MineEntranceFactory } from "../buildings/MineEntrance"
import { MineExitFactory } from "../buildings/MineExit"
import { TentFactory } from "../buildings/Tent"
import { TeleporterFactory } from "../Teleporter"
import { BedFactory } from "./Bed"
import { BenchFactory } from "./BenchFactory"
import { CampfireFactory } from "./Campfire"
import { ChestFactory } from "./Chest"
import { ElementFactory } from "./ElementFactory"
import { MushroomFactory } from "./Mushroom"
import { RockFactory } from "./Rock"
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
    CHURCH,
    BENCH,
}

window["ElementType"] = ElementType

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
        [ElementType.CHURCH]: new ChurchFactory(),
        [ElementType.MINE_ENTRANCE]: new MineEntranceFactory(),
        [ElementType.MINE_EXIT]: new MineExitFactory(),
        [ElementType.BENCH]: new BenchFactory(),
    }

    getElementFactory(type: ElementType) {
        return this.ELEMENT_FACTORIES[type]
    }
}
