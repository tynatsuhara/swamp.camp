import { ShieldType } from "./weapons/ShieldType"
import { WeaponType } from "./weapons/WeaponType"

type EquipmentTypes = {
    weapon: WeaponType
    shield: ShieldType
}

export type EquipmentSlot = keyof EquipmentTypes
export type EquipmentType<T extends EquipmentSlot> = EquipmentTypes[T]
