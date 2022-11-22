import { ActiveCondition } from "../characters/Condition"
import { DudeType } from "../characters/DudeType"
import { ShieldType } from "../characters/weapons/ShieldType"
import { WeaponType } from "../characters/weapons/WeaponType"
import { ItemStack } from "../items/Inventory"

export class DudeSaveState {
    uuid: string
    type: DudeType
    pos: string
    anim: string
    weapon: WeaponType
    shield: ShieldType
    maxHealth: number
    health: number
    inventory: ItemStack[]
    dialogue: string
    blob: object // This can be used for DudeType-specific data
    conditions: ActiveCondition[]
    name?: string
}
