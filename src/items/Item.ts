import { expose } from "brigsby/dist"
import { ShieldType } from "../characters/weapons/ShieldType"
import { WeaponType } from "../characters/weapons/WeaponType"

export enum Item {
    COIN,
    ROCK,
    WOOD,
    TENT,
    CAMPFIRE,
    IRON,
    HOUSE,
    ROUND_SAPLING,
    POINTY_SAPLING,
    MUSHROOM,
    CHEST,
    BED,
    MINE_ENTRANCE,
    CHURCH,
    WEAK_MEDICINE,
    HEART_CONTAINER,
    APOTHECARY,
    POISON_ANTIDOTE,
    RAW_MEAT,
    BLACKBERRIES,
    SMALL_CABIN,
    COOKED_MEAT,
    EXPLORER_MAP,
    LAMP_OIL,

    // weapon values should match the WeaponType enum so we can cast them
    KNIFE = WeaponType.KNIFE,
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

    // shield values should match the ShieldType enum so we can cast them
    BASIC_SHIELD = ShieldType.BASIC,
    LANTERN,
    TORCH,
}

expose({ Item })
