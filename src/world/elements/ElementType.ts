// Elements are things which take up 1+ squares on top of the ground

import { expose } from "brigsby/dist"

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
    PLACED_LANTERN,
    WORKBENCH,
}

expose({ ElementType })
