import { DudeType } from "../characters/DudeFactory"
import { ItemStack } from "../items/Inventory"
import { Dialogue } from "../characters/Dialogue"
import { WeaponType } from "../characters/Weapon"

// Nothing in here should be nullable, or the logic in DudeFactory could break
export class DudeSaveState {
    type: DudeType
    pos: string
    anim: string
    weapon: WeaponType
    shield: string  // TODO add shieldType
    maxHealth: number
    health: number
    speed: number
    inventory: ItemStack[]
    dialogue: Dialogue
    blob: object // This can be used for DudeType-specific data
}