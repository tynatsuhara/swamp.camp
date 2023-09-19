import { ROCKS_NEEDED_FOR_CAMPFIRE } from "../characters/dialogue/DipDialogue"
import { saveManager } from "../core/SaveManager"
import { Icon } from "../graphics/OneBitTileset"
import { ItemStack } from "./Inventory"
import { Item } from "./Item"

export type CraftingRecipe = {
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
            output: Item.CHEST,
            input: [new ItemStack(Item.WOOD, 10)],
        },
        {
            output: Item.BED,
            // TODO: This should require something that isn't immediately attainable. Some kind of padding? Wool?
            input: [new ItemStack(Item.WOOD, 10)],
        }
    )

    const equipment: CraftingRecipeCategory = {
        icon: "shovel",
        name: "Equipment",
        recipes: [
            {
                output: Item.PICKAXE,
                input: [new ItemStack(Item.IRON, 3), new ItemStack(Item.WOOD, 5)],
            },
            {
                output: Item.AXE,
                input: [new ItemStack(Item.IRON, 3), new ItemStack(Item.WOOD, 5)],
            },
            {
                output: Item.SWORD,
                input: [new ItemStack(Item.IRON, 3), new ItemStack(Item.WOOD, 5)],
            },
            // {
            //     desc: "Ranged or melee weapon",
            //     output: Item.SPEAR,
            //     input: [new ItemStack(Item.ROCK, 1), new ItemStack(Item.WOOD, 3)],
            // },
            {
                output: Item.LANTERN,
                input: [new ItemStack(Item.IRON, 2)],
            },
        ],
    }

    return [utilities, equipment]
}

// TODO should these be crafting recipes? Or purchase menu?
export const getBertoRecipes = (): CraftingRecipeCategory[] => {
    const buildings: CraftingRecipeCategory = {
        icon: "church",
        name: "Blueprints",
        recipes: [
            {
                output: Item.MINE_ENTRANCE,
                input: [new ItemStack(Item.ROCK, 5), new ItemStack(Item.WOOD, 5)],
            },
            // TODO: House details (house multiple convicts?) — probably call it "workers' quarters"
            {
                output: Item.HOUSE,
                input: [new ItemStack(Item.ROCK, 5), new ItemStack(Item.WOOD, 5)],
            },
        ],
    }

    // TODO: How should we determine when a church can be built?
    //       Instead of doing it like this, there should be a canBuildChurch
    //       flag and Berto should deliver an announcement

    // const houses = camp()
    //     .getElementsOfType(ElementType.HOUSE)
    //     .flatMap((h) => h.entity.getComponents(Residence))

    // if (houses.length >= 3 && houses.every((h) => h.getResidents().length > 0)) {
    //     buildings.recipes.push({
    //         desc: "Church",
    //         output: Item.CHURCH,
    //         input: [new ItemStack(Item.ROCK, 5), new ItemStack(Item.WOOD, 5)],
    //     })
    // }

    return [buildings]
}

export const getCookingRecipes = (): CraftingRecipeCategory[] => {
    return [
        {
            icon: "bread",
            name: "Foodstuffs",
            recipes: [
                {
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
