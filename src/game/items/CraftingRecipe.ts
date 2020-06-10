import { Item } from "./Items"
import { ItemStack } from "./Inventory"

export type CraftingRecipe = {
    output: Item,
    input: ItemStack[]
}