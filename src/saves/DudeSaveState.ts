import { DudeType } from "../characters/DudeFactory"
import { ItemStack } from "../items/Inventory"
import { WeaponType } from "../characters/weapons/WeaponType"
import { ShieldType } from "../characters/weapons/ShieldType"

// Nothing in here should be nullable, or the logic in DudeFactory could break
export class DudeSaveState {
    uuid: string
    type: DudeType
    pos: string
    anim: string
    weapon: WeaponType
    shield: ShieldType
    maxHealth: number
    health: number
    speed: number
    inventory: ItemStack[]
    dialogue: string
    blob: object // This can be used for DudeType-specific data
}
