import { expose } from "brigsby/dist/Debug"

export enum DudeType {
    PLAYER,
    DIP,
    ELF,
    ORC_WARRIOR,
    HERALD,
    HORNED_DEMON,
    SHROOM,
    VILLAGER, // TODO maybe rename this to something like WORKER?
    CENTAUR,
    BEAR,
    ORC_BRUTE,
    ORC_SHAMAN,
    DEMON_BRUTE,
    WOLF,
    CLERIC,
    NUN,
    BISHOP,
    SWAMP_THING,
    DOCTOR,
    BLACKSMITH,
    SPOOKY_VISITOR,
    GNOLL_SCOUT,
    TRAVELING_MERCHANT,
    GUMBALL,
    ONION,
    KNIGHT,
    FOREST_GUARDIAN,
    GNOLL_SHAMAN,
    GNOLL_OVERSEER,
    MIMIC,
}

expose({ DudeType })
