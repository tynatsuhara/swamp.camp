import { Singletons } from "../../Singletons"
import { ApothecaryFactory } from "../buildings/Apothecary"
import { CabinFactory } from "../buildings/Cabin"
import { ChurchFactory } from "../buildings/Church"
import { HouseFactory } from "../buildings/House"
import { MineEntranceFactory } from "../buildings/MineEntrance"
import { MineExitFactory } from "../buildings/MineExit"
import { TentFactory } from "../buildings/Tent"
import { TeleporterIndicatorFactory } from "../TeleporterIndicator"
import { BedFactory } from "./Bed"
import { BlackberriesFactory } from "./Blackberries"
import { CampfireFactory } from "./Campfire"
import { ChestFactory } from "./Chest"
import { FurnitureFactory } from "./FurnitureFactory"
import { MushroomFactory } from "./Mushroom"
import { QueequegFactory } from "./Queequeg"
import { RockFactory } from "./Rock"
import { TreeFactory } from "./Tree"

// Elements are things which take up 1+ squares on top of the ground
export enum ElementType {
    TREE_ROUND,
    TREE_POINTY,
    ROCK,
    TENT,
    CAMPFIRE,
    TELEPORTER_INDICATOR,
    HOUSE,
    MUSHROOM,
    CHEST,
    BED,
    MINE_ENTRANCE,
    MINE_EXIT,
    CHURCH,
    BENCH,
    PODIUM,
    QUEEQUEG,
    APOTHECARY,
    BLACKBERRIES,
    CABIN,
    BEDROLL,
}

window["ElementType"] = ElementType

const ELEMENT_FACTORIES = {
    [ElementType.TREE_ROUND]: new TreeFactory(ElementType.TREE_ROUND),
    [ElementType.TREE_POINTY]: new TreeFactory(ElementType.TREE_POINTY),
    [ElementType.ROCK]: new RockFactory(),
    [ElementType.CAMPFIRE]: new CampfireFactory(),
    [ElementType.TELEPORTER_INDICATOR]: new TeleporterIndicatorFactory(),
    [ElementType.MUSHROOM]: new MushroomFactory(),
    [ElementType.CHEST]: new ChestFactory(),
    [ElementType.BED]: new BedFactory(ElementType.BED),
    [ElementType.BEDROLL]: new BedFactory(ElementType.BEDROLL),
    [ElementType.TENT]: new TentFactory(),
    [ElementType.HOUSE]: new HouseFactory(),
    [ElementType.CHURCH]: new ChurchFactory(),
    [ElementType.MINE_ENTRANCE]: new MineEntranceFactory(),
    [ElementType.MINE_EXIT]: new MineExitFactory(),
    [ElementType.BENCH]: new FurnitureFactory(ElementType.BENCH, "bench"),
    [ElementType.PODIUM]: new FurnitureFactory(ElementType.PODIUM, "podium"),
    [ElementType.QUEEQUEG]: new QueequegFactory(),
    [ElementType.APOTHECARY]: new ApothecaryFactory(),
    [ElementType.BLACKBERRIES]: new BlackberriesFactory(),
    [ElementType.CABIN]: new CabinFactory(),
}

export type ElementDataFormat = {
    [P in keyof typeof ELEMENT_FACTORIES]?: ReturnType<
        ReturnType<typeof ELEMENT_FACTORIES[P]["make"]>["save"]
    >
}

export class Elements {
    // TODO get rid of instance
    static get instance() {
        return Singletons.getOrCreate(Elements)
    }

    getElementFactory(type: ElementType) {
        return ELEMENT_FACTORIES[type]
    }
}

export class SavedElement {
    pos: string
    type: ElementType
    obj: object
}
