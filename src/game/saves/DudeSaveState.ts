import { DudeType } from "../characters/DudeFactory"
import { ItemStack } from "../items/Inventory"
import { Dialogue } from "../characters/Dialogue"

export class DudeSaveState {
    type: DudeType
    pos: string
    // TODO make weapon and shield saveable objects instead of just keys
    weapon: string
    shield: string
    maxHealth: number
    health: number
    speed: number
    inventory: ItemStack[]
    dialogue: Dialogue
    blob: object // This can be used for DudeType-specific data
}