import { Item } from "./Items"
import { ItemStack } from "./Inventory"
import { StaticTileSource } from "../../engine/tiles/StaticTileSource"

export type CraftingRecipe = {
    output: Item,
    input: ItemStack[],
}

export type CraftingRecipeCategory = {
    icon: StaticTileSource,
    name: string,
    recipes: CraftingRecipe[],
}