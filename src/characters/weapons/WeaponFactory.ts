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
    make(type: WeaponType, dudeType: DudeType): Weapon {
        const offset = offsetForDudeType(dudeType)
        switch (type) {
            case WeaponType.NONE:
                return null
            case WeaponType.UNARMED:
                return new UnarmedWeapon()
            case WeaponType.SWORD:
                return new MeleeWeapon({
                    weaponType: WeaponType.SWORD,
                    spriteId: "weapon_regular_sword",
                    offsetFromCenter: new Point(-6, -2).plus(offset),
                    range: 20,
                    damage: 1,
                    canMultiAttack: false,
                    speed: 1,
                })
            case WeaponType.CLUB:
                return new MeleeWeapon({
                    weaponType: WeaponType.CLUB,
                    spriteId: "weapon_baton_with_spikes",
                    offsetFromCenter: new Point(-6, -2).plus(offset),
                    range: 16,
                    damage: 1,
                    canMultiAttack: false,
                    speed: 1,
                })
            case WeaponType.PICKAXE:
                return new MeleeWeapon({
                    weaponType: WeaponType.PICKAXE,
                    spriteId: "weapon_pickaxe",
                    offsetFromCenter: new Point(-5, -2).plus(offset),
                    range: 16,
                    damage: 1,
                    canMultiAttack: false,
                    speed: 1,
                })
            case WeaponType.AXE:
                return new MeleeWeapon({
                    weaponType: WeaponType.AXE,
                    spriteId: "weapon_axe",
                    offsetFromCenter: new Point(-3, -1).plus(offset),
                    range: 16,
                    damage: 1,
                    canMultiAttack: false,
                    speed: 1,
                })
            case WeaponType.SPEAR:
                return new SpearWeapon() // NPCs can't currently use ranged weapons
            case WeaponType.STAFF_1:
                return new StaffWeapon() // Players can't currently use AOE weapons
            default:
                throw new Error(`weapon type ${type} is not supported yet`)
        }
    },
}
