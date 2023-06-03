import { Point } from "brigsby/dist"
import { DudeType } from "../DudeType"
import { MeleeWeapon } from "./MeleeWeapon"
import { SpearWeapon } from "./SpearWeapon"
import { StaffWeapon } from "./StaffWeapon"
import { UnarmedWeapon } from "./UnarmedWeapon"
import { Weapon } from "./Weapon"
import { WeaponType } from "./WeaponType"

const offsetForDudeType = (type: DudeType) => {
    switch (type) {
        case DudeType.ORC_BRUTE:
            return new Point(-2, -3)
        case DudeType.FOREST_GUARDIAN:
            return new Point(-4, -4)
        default:
            return Point.ZERO
    }
}

export const WeaponFactory = {
    // TODO support additional weapons
    make(weaponType: WeaponType, dudeType: DudeType): Weapon {
        const offset = offsetForDudeType(dudeType)
        switch (weaponType) {
            case WeaponType.NONE:
                return null
            case WeaponType.UNARMED:
                return new UnarmedWeapon()
            case WeaponType.KNIFE:
                return new MeleeWeapon({
                    weaponType,
                    spriteId: "weapon_knife",
                    offsetFromCenter: new Point(-5, -3).plus(offset),
                    range: 10,
                    damage: 0.5,
                    canMultiAttack: false,
                    speed: 2,
                })
            case WeaponType.SHITTY_SWORD:
                return new MeleeWeapon({
                    weaponType,
                    spriteId: "weapon_rusty_sword",
                    offsetFromCenter: new Point(-6, -2).plus(offset),
                    range: 20,
                    damage: 0.8,
                    canMultiAttack: false,
                    speed: 0.8,
                })
            case WeaponType.SWORD:
                return new MeleeWeapon({
                    weaponType,
                    spriteId: "weapon_regular_sword",
                    offsetFromCenter: new Point(-6, -2).plus(offset),
                    range: 20,
                    damage: 1,
                    canMultiAttack: false,
                    speed: 1,
                })
            case WeaponType.FANCY_SWORD:
                return new MeleeWeapon({
                    weaponType,
                    spriteId: "weapon_red_gem_sword",
                    offsetFromCenter: new Point(-6, -2).plus(offset),
                    range: 20,
                    damage: 2,
                    canMultiAttack: false,
                    speed: 1.2,
                })
            case WeaponType.BIG_HAMMER:
                return new MeleeWeapon({
                    weaponType,
                    spriteId: "weapon_big_hammer",
                    offsetFromCenter: new Point(-5, -2).plus(offset),
                    range: 30,
                    damage: 2,
                    canMultiAttack: true,
                    speed: 0.5,
                })
            case WeaponType.HAMMER:
                return new MeleeWeapon({
                    weaponType,
                    spriteId: "weapon_hammer",
                    offsetFromCenter: new Point(-5, -2).plus(offset),
                    range: 16,
                    damage: 1,
                    canMultiAttack: false,
                    speed: 0.75,
                })
            case WeaponType.CLUB:
                return new MeleeWeapon({
                    weaponType,
                    spriteId: "weapon_baton_with_spikes",
                    offsetFromCenter: new Point(-6, -2).plus(offset),
                    range: 16,
                    damage: 1,
                    canMultiAttack: false,
                    speed: 1,
                })
            case WeaponType.MACE:
                return new MeleeWeapon({
                    weaponType,
                    spriteId: "weapon_mace",
                    offsetFromCenter: new Point(-6, -2).plus(offset),
                    range: 16,
                    damage: 2,
                    canMultiAttack: false,
                    speed: 0.7,
                })
            case WeaponType.KATANA:
                return new MeleeWeapon({
                    weaponType,
                    spriteId: "weapon_katana",
                    offsetFromCenter: new Point(-6, -2).plus(offset),
                    range: 30,
                    damage: 2,
                    canMultiAttack: false,
                    speed: 1.5,
                })
            case WeaponType.SERRATED_SWORD:
                return new MeleeWeapon({
                    weaponType,
                    spriteId: "weapon_saw_sword",
                    offsetFromCenter: new Point(-6, -2).plus(offset),
                    range: 20,
                    damage: 2,
                    canMultiAttack: true,
                    speed: 0.9,
                })
            case WeaponType.BIG_SWORD:
                return new MeleeWeapon({
                    weaponType,
                    spriteId: "weapon_anime_sword",
                    offsetFromCenter: new Point(-6, -2).plus(offset),
                    range: 25,
                    damage: 2,
                    canMultiAttack: false,
                    speed: 1,
                })
            case WeaponType.AXE:
                return new MeleeWeapon({
                    weaponType,
                    spriteId: "weapon_axe",
                    offsetFromCenter: new Point(-4, -1).plus(offset),
                    range: 16,
                    damage: 1,
                    canMultiAttack: false,
                    speed: 1,
                })
            case WeaponType.MACHETE:
                return new MeleeWeapon({
                    weaponType,
                    spriteId: "weapon_machete",
                    offsetFromCenter: new Point(-5, -2).plus(offset),
                    range: 16,
                    damage: 1.5,
                    canMultiAttack: false,
                    speed: 1.3,
                })
            case WeaponType.CLEAVER:
                return new MeleeWeapon({
                    weaponType,
                    spriteId: "weapon_cleaver",
                    offsetFromCenter: new Point(-3, -2).plus(offset),
                    range: 16,
                    damage: 1.5,
                    canMultiAttack: false,
                    speed: 1.3,
                })
            case WeaponType.FENCING_SWORD:
                return new MeleeWeapon({
                    weaponType,
                    spriteId: "weapon_duel_sword",
                    offsetFromCenter: new Point(-5, -2).plus(offset),
                    range: 25,
                    damage: 2,
                    canMultiAttack: false,
                    speed: 2,
                })
            case WeaponType.GREATSWORD:
                return new MeleeWeapon({
                    weaponType,
                    spriteId: "weapon_knight_sword",
                    offsetFromCenter: new Point(-6, -2).plus(offset),
                    range: 25,
                    damage: 2,
                    canMultiAttack: false,
                    speed: 2,
                })
            case WeaponType.GOLD_SWORD:
                return new MeleeWeapon({
                    weaponType,
                    spriteId: "weapon_golden_sword",
                    offsetFromCenter: new Point(-6, -2).plus(offset),
                    range: 20,
                    damage: 2,
                    canMultiAttack: false,
                    speed: 1,
                })
            case WeaponType.BIG_GOLD_SWORD:
                return new MeleeWeapon({
                    weaponType,
                    spriteId: "weapon_lavish_sword",
                    offsetFromCenter: new Point(-6, -2).plus(offset),
                    range: 20,
                    damage: 2.5,
                    canMultiAttack: false,
                    speed: 1,
                })
            case WeaponType.STAFF_1:
                return new StaffWeapon() // Players can't currently use AOE weapons
            case WeaponType.STAFF_2:
                return new StaffWeapon() // TODO
            case WeaponType.SPEAR:
                return new SpearWeapon() // NPCs can't currently use ranged weapons
            case WeaponType.PICKAXE:
                return new MeleeWeapon({
                    weaponType,
                    spriteId: "weapon_pickaxe",
                    offsetFromCenter: new Point(-5, -2).plus(offset),
                    range: 16,
                    damage: 1,
                    canMultiAttack: false,
                    speed: 0.75,
                })
            default:
                return assertUnreachable(weaponType)
        }
    },
}

function assertUnreachable(x: never): never {
    throw new Error("Didn't expect to get here")
}
