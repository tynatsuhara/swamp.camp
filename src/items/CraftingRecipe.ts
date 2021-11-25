import { Point } from "brigsby/dist/Point"
import { StaticSpriteSource } from "brigsby/dist/sprites/StaticSpriteSource"
import {
    ROCKS_NEEDED_FOR_CAMPFIRE,
    WOOD_NEEDED_FOR_CAMPFIRE,
} from "../characters/dialogue/DipDialogue"
import { Tilesets } from "../graphics/Tilesets"
import { ItemStack } from "./Inventory"
import { Item } from "./Items"

export type CraftingRecipe = {
    desc: String
    output: Item
    input: ItemStack[]
}

export type CraftingRecipeCategory = {
    icon: StaticSpriteSource
    name: string
    recipes: CraftingRecipe[]
}

// TODO: Make it so recipes are unlocked over time
export const getDipRecipes = (): CraftingRecipeCategory[] => {
    const utilities = {
        icon: Tilesets.instance.oneBit.getTileAt(new Point(0, 7)),
        name: "Utilities",
        recipes: [
            {
                desc: "Illuminates an area",
                output: Item.CAMPFIRE,
                input: [
                    new ItemStack(Item.ROCK, ROCKS_NEEDED_FOR_CAMPFIRE),
                    new ItemStack(Item.WOOD, WOOD_NEEDED_FOR_CAMPFIRE),
                ],
            },
            {
                desc: "Stores junk",
                output: Item.CHEST,
                input: [new ItemStack(Item.WOOD, 10)],
            },
            {
                desc: "Snooze to pass time",
                output: Item.BED,
                input: [new ItemStack(Item.WOOD, 10)],
            },
        ],
    }

    const equipment = {
        icon: Tilesets.instance.oneBit.getTileAt(new Point(10, 27)),
        name: "Equipment",
        recipes: [
            {
                desc: "Collects extra iron",
                output: Item.PICKAXE,
                input: [new ItemStack(Item.IRON, 3), new ItemStack(Item.WOOD, 5)],
            },
            {
                desc: "Collects extra wood",
                output: Item.AXE,
                input: [new ItemStack(Item.IRON, 3), new ItemStack(Item.WOOD, 5)],
            },
            {
                desc: "Ranged or melee weapon",
                output: Item.SPEAR,
                input: [new ItemStack(Item.ROCK, 1), new ItemStack(Item.WOOD, 3)],
            },
            {
                desc: "Portable light source",
                output: Item.LANTERN,
                input: [new ItemStack(Item.IRON, 2)],
            },
        ],
    }

    const buildings = {
        icon: Tilesets.instance.oneBit.getTileAt(new Point(0, 19)),
        name: "Buildings",
        recipes: [
            {
                desc: "Houses one settler",
                output: Item.HOUSE,
                input: [new ItemStack(Item.ROCK, 5), new ItemStack(Item.WOOD, 5)],
            },
        ],
    }

    /*
    const houses = LocationManager.instance
        .exterior()
        .getElementsOfType(ElementType.HOUSE)
        .map((h) => h.entity.getComponent(Residence))

    if (houses.length >= 3 && houses.every((h) => h.getResidents().length > 0)) {
        buildings.recipes.push({
            desc: "Church",
            output: Item.CHURCH,
            input: [new ItemStack(Item.ROCK, 5), new ItemStack(Item.WOOD, 5)],
        })
    }
    */

    return [utilities, equipment, buildings]
}
