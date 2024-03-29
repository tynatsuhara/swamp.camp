import { expose } from "brigsby/dist"

export enum WeaponType {
    NONE = 99999,
    UNARMED,
    KNIFE,
    SHITTY_SWORD,
    SWORD,
    FANCY_SWORD,
    BIG_HAMMER,
    HAMMER,
    CLUB,
    MACE,
    KATANA,
    SERRATED_SWORD,
    BIG_SWORD,
    AXE,
    MACHETE,
    CLEAVER,
    FENCING_SWORD,
    GREATSWORD,
    GOLD_SWORD,
    BIG_GOLD_SWORD,
    STAFF_1,
    STAFF_2,
    SPEAR,
    PICKAXE,
}

expose({ WeaponType })
