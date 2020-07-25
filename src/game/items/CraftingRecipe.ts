import { Item } from "./Items"
import { ItemStack } from "./Inventory"
import { StaticTileSource } from "../../engine/tiles/StaticTileSource"
import { Tilesets } from "../graphics/Tilesets"
import { Point } from "../../engine/point"
import { ROCKS_NEEDED_FOR_CAMPFIRE, WOOD_NEEDED_FOR_CAMPFIRE } from "../characters/dialogues/DipIntro"

export type CraftingRecipe = {
    output: Item,
    input: ItemStack[],
}

export type CraftingRecipeCategory = {
    icon: StaticTileSource,
    name: string,
    recipes: CraftingRecipe[],
}

export const getDipRecipes = (): CraftingRecipeCategory[] => [{ 
    icon: Tilesets.instance.oneBit.getTileAt(new Point(0, 7)),
    name: "Outdoor Furniture",
    recipes: [{
        output: Item.CAMPFIRE,
        input: [new ItemStack(Item.ROCK, ROCKS_NEEDED_FOR_CAMPFIRE), new ItemStack(Item.WOOD, WOOD_NEEDED_FOR_CAMPFIRE)],
    }],
},{ 
    icon: Tilesets.instance.oneBit.getTileAt(new Point(10, 27)),
    name: "Equipment",
    recipes: [{
        output: Item.PICKAXE,
        input: [new ItemStack(Item.IRON, 3), new ItemStack(Item.WOOD, 5)],
    },{
        output: Item.AXE,
        input: [new ItemStack(Item.IRON, 3), new ItemStack(Item.WOOD, 5)],
    }],
},{ 
    icon: Tilesets.instance.oneBit.getTileAt(new Point(0, 19)),
    name: "Buildings",
    recipes: [{
        output: Item.TENT,
        input: [new ItemStack(Item.WOOD, 5)],
    }],
}]