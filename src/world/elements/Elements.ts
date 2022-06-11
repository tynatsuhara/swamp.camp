import { Singletons } from "../../Singletons"
import { ApothecaryFactory } from "../buildings/Apothecary"
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
import { ElementFactory } from "./ElementFactory"
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
}

window["ElementType"] = ElementType

const ELEMENT_FACTORIES = [
    new TreeFactory(ElementType.TREE_ROUND),
    new TreeFactory(ElementType.TREE_POINTY),
    new RockFactory(),
    new CampfireFactory(),
    new TeleporterIndicatorFactory(),
    new MushroomFactory(),
    new ChestFactory(),
    new BedFactory(),
    new TentFactory(),
    new HouseFactory(),
    new ChurchFactory(),
    new MineEntranceFactory(),
    new MineExitFactory(),
    new FurnitureFactory(ElementType.BENCH, "bench"),
    new FurnitureFactory(ElementType.PODIUM, "podium"),
    new QueequegFactory(),
    new ApothecaryFactory(),
    new BlackberriesFactory(),
]

export class Elements {
    static get instance() {
        return Singletons.getOrCreate(Elements)
    }

    private readonly factories: { [key: number]: ElementFactory } = {}

    constructor() {
        ELEMENT_FACTORIES.forEach((f) => {
            if (this.factories[f.type]) {
                throw new Error("duplicate element factory!!!!!")
            }
            this.factories[f.type] = f
        })
    }

    getElementFactory(type: ElementType) {
        return this.factories[type]
    }
}

export class SavedElement {
    pos: string
    type: ElementType
    obj: object
}
