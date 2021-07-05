import { WeaponType } from "./WeaponType"
import { Weapon } from "./Weapon"
import { UnarmedWeapon } from "./UnarmedWeapon"
import { MeleeWeapon } from "./MeleeWeapon"
import { Point } from "brigsby/dist/Point"
import { SpearWeapon } from "./SpearWeapon"
import { DudeType } from "../DudeFactory"
import { StaffWeapon } from "./StaffWeapon"

const offsetForDudeType = (type: DudeType) => {
    switch (type) {
        case DudeType.ORC_BRUTE:
            return new Point(-2, -3)
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
                return new MeleeWeapon(WeaponType.SWORD, "weapon_regular_sword", new Point(-6, -2).plus(offset))
            case WeaponType.CLUB:
                return new MeleeWeapon(WeaponType.CLUB, "weapon_baton_with_spikes", new Point(-6, -2).plus(offset))
            case WeaponType.PICKAXE:
                return new MeleeWeapon(WeaponType.PICKAXE, "weapon_pickaxe", new Point(-5, -2).plus(offset))
            case WeaponType.AXE:
                return new MeleeWeapon(WeaponType.AXE, "weapon_axe", new Point(-3, -1).plus(offset))
            case WeaponType.SPEAR:
                return new SpearWeapon()  // NPCs can't currently use ranged weapons
            case WeaponType.STAFF_1:
                return new StaffWeapon()
            default:
                throw new Error(`weapon type ${type} is not supported yet`)
        }
    }
}