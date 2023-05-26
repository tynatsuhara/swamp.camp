import { DudeType } from "../characters/DudeType"

const SPAWNABLE_TYPES = [
    // Wildlife
    DudeType.WOLF,
    DudeType.SWAMP_THING,
    DudeType.BEAR,
    DudeType.SHROOM,

    // Demons
    DudeType.HORNED_DEMON,
    DudeType.DEMON_BRUTE,

    // Orcs
    DudeType.ORC_WARRIOR,
    DudeType.ORC_BRUTE,
    DudeType.ORC_SHAMAN,

    // Villagers
    DudeType.VILLAGER,
    DudeType.DOCTOR,
    DudeType.BLACKSMITH,
    DudeType.SPOOKY_VISITOR,
    DudeType.TRAVELING_MERCHANT,
    DudeType.KNIGHT,
    DudeType.CLERIC,
    DudeType.NUN,
    DudeType.BISHOP,

    // Pets
    DudeType.GUMBALL,
    DudeType.ONION,

    // Misc
    DudeType.FOREST_GUARDIAN,
    DudeType.GNOLL_SCOUT,
    DudeType.GNOLL_SHAMAN,
    DudeType.GNOLL_OVERSEER,
    DudeType.CENTAUR,
    DudeType.ELF,
    DudeType.MIMIC,
    DudeType.SKELETON,
]

export const spawnMenu = {
    isOpen: false,
    page: 0,
    pageSize: 10,
    setSelectedType: (type: DudeType) => {
        localStorage.setItem("spawnMenuType", JSON.stringify(type))
    },
    getSelectedType: () => {
        const cacheType = localStorage.getItem("spawnMenuType")
        return cacheType ? (JSON.parse(cacheType) as DudeType) : SPAWNABLE_TYPES[0]
    },
    types: SPAWNABLE_TYPES,
}
