import { WeaponType } from "./WeaponType"
import { Weapon } from "./Weapon"
import { UnarmedWeapon } from "./UnarmedWeapon"
import { MeleeWeapon } from "./MeleeWeapon"
import { Point } from "../../../engine/Point"
import { SpearWeapon } from "./SpearWeapon"

export const WeaponFactory = {

    // TODO support additional weapons
    make(type: WeaponType): Weapon {
        switch (type) {
            case WeaponType.NONE:
                return null
            case WeaponType.UNARMED:
                return new UnarmedWeapon()
            case WeaponType.SWORD:
                return new MeleeWeapon(WeaponType.SWORD, "weapon_regular_sword", new Point(-6, -2))
            case WeaponType.CLUB:
                return new MeleeWeapon(WeaponType.CLUB, "weapon_baton_with_spikes", new Point(-6, -2))
            case WeaponType.PICKAXE:
                return new MeleeWeapon(WeaponType.PICKAXE, "weapon_pickaxe", new Point(-5, -2))
            case WeaponType.AXE:
                return new MeleeWeapon(WeaponType.AXE, "weapon_axe", new Point(-3, -1))
            case WeaponType.SPEAR:
                return new SpearWeapon()
            default:
                throw new Error(`weapon type ${type} is not supported yet`)
        }
    }
}