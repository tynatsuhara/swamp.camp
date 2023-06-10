import { ROCKS_NEEDED_FOR_CAMPFIRE } from "../characters/dialogue/DipDialogue"
import { saveManager } from "../core/SaveManager"
import { Icon } from "../graphics/OneBitTileset"
import { ItemStack } from "./Inventory"
import { Item } from "./Item"

export type CraftingRecipe = {
    desc: String
    output: Item
    input: ItemStack[]
}

export type CraftingRecipeCategory = {
    icon: Icon
    name: string
    recipes: CraftingRecipe[]
}

export const getDipRecipes = (): CraftingRecipeCategory[] => {
    const utilities: CraftingRecipeCategory = {
        icon: "direction-sign",
        name: "Utilities",
        recipes: [
            {
                desc: "Illuminates an area",
                output: Item.CAMPFIRE,
                input: [new ItemStack(Item.ROCK, ROCKS_NEEDED_FOR_CAMPFIRE)],
            },
        ],
    }

    if (!saveManager.getState().hasMadeFire) {
        return [utilities]
    }

    utilities.recipes.push(
        {
            desc: "Stores junk",
            output: Item.CHEST,
            input: [new ItemStack(Item.WOOD, 10)],
        },
        {
            desc: "Snooze to pass time",
            output: Item.BED,
            // TODO: This should require something that isn't immediately attainable. Some kind of padding?
            input: [new ItemStack(Item.WOOD, 10)],
        }
    )

    const equipment: CraftingRecipeCategory = {
        icon: "shovel",
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
                desc: "Slices and/or dices",
                output: Item.SWORD,
                input: [new ItemStack(Item.IRON, 3), new ItemStack(Item.WOOD, 5)],
            },
            // {
            //     desc: "Ranged or melee weapon",
            //     output: Item.SPEAR,
            //     input: [new ItemStack(Item.ROCK, 1), new ItemStack(Item.WOOD, 3)],
            // },
            {
                desc: "Portable light source",
                output: Item.LANTERN,
                input: [new ItemStack(Item.IRON, 2)],
            },
        ],
    }

    // TODO: Allow purchasing plans from Berto
    // const buildings: CraftingRecipeCategory = {
    //     icon: "church",
    //     name: "Blueprints",
    //     recipes: [
    //         {
    //             desc: "Houses one settler",
    //             output: Item.HOUSE,
    //             input: [new ItemStack(Item.ROCK, 5), new ItemStack(Item.WOOD, 5)],
    //         },
    //     ],
    // }

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

    return [utilities, equipment]
}

export const getCookingRecipes = (): CraftingRecipeCategory[] => {
    return [
        {
            // TODO: don't show icon if there's only one category?
            icon: "bread",
            name: "Foodstuffs",
            recipes: [
                {
                    desc: "+2 health",
                    output: Item.COOKED_MEAT,
                    input: [new ItemStack(Item.RAW_MEAT, 1)],
                },
            ],
        },
    ]
}

export const getWorkbenchRecipes = (): CraftingRecipeCategory[] => {
    return getDipRecipes() // TODO
}
