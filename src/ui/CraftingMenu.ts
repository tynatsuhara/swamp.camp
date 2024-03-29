import { Component, Entity, Point, pt, UpdateData } from "brigsby/dist"
import { BasicRenderComponent, RectRender, RenderMethod, TextRender } from "brigsby/dist/renderer"
import { NineSlice, SpriteTransform, StaticSpriteSource } from "brigsby/dist/sprites"
import { Maths } from "brigsby/dist/util"
import { loadAudio } from "../audio/DeferLoadAudio"
import { Sounds } from "../audio/Sounds"
import { Dude } from "../characters/Dude"
import { player } from "../characters/player"
import { controls } from "../core/Controls"
import { Singletons } from "../core/Singletons"
import { Camera } from "../cutscenes/Camera"
import { Icon } from "../graphics/OneBitTileset"
import { TILE_SIZE, Tilesets } from "../graphics/Tilesets"
import {
    CraftingRecipe,
    CraftingRecipeCategory,
    getWorkbenchRecipes,
} from "../items/CraftingRecipe"
import { Item } from "../items/Item"
import { ITEM_METADATA_MAP } from "../items/Items"
import { clientSyncFn } from "../online/syncUtils"
import { EventDispatcher } from "../utils/EventDispatcher"
import { ClickableUI } from "./ClickableUI"
import { Color } from "./Color"
import { getIconSprite } from "./IconSprite"
import { PaginatedMenu } from "./PaginatedMenu"
import { TEXT_FONT, TEXT_SIZE } from "./Text"
import { Tooltip } from "./Tooltip"
import { UI_SPRITE_DEPTH } from "./UiConstants"
import { UISounds } from "./UISounds"

const COLOR_TEXT_HOVERED = Color.WHITE
const COLOR_BACKGROUND = Color.RED_2
const COLOR_BACKGROUND_BORDER = Color.RED_1
const COLOR_TEXT_NOT_HOVERED = Color.PINK_3
const COLOR_LACKING_INGREDIENT = Color.RED_1
const RECIPES_PER_PAGE = 5

const CRAFT_NOISE = "audio/rpg/inventory/metal-small3.wav"
const COOK_NOISE = "audio/misc/cc0-fireball-01.wav"
loadAudio([CRAFT_NOISE, COOK_NOISE])

type CraftMode = "craft" | "cook"

export class CraftingMenu extends PaginatedMenu {
    static get instance() {
        return Singletons.getOrCreate(CraftingMenu)
    }

    private readonly e: Entity = new Entity([this]) // entity for this component
    private displayEntity: Entity
    isOpen = false
    private recipes: CraftingRecipeCategory[]
    private recipeCategory: number
    private dimensions = new Point(180, 33 + 24 * RECIPES_PER_PAGE)
    private innerDimensions = this.dimensions.minus(new Point(10, 14))
    private justCraftedRow = -1 // if this is non-negative, this row was just crafted and will be highlighted
    private tooltip = this.e.addComponent(new Tooltip())
    private mode: CraftMode

    get pages() {
        return Math.ceil(this.recipes[this.recipeCategory].recipes.length / RECIPES_PER_PAGE)
    }

    constructor() {
        super()

        EventDispatcher.instance.listen("craft-workbench", () => {
            this.open(getWorkbenchRecipes())
        })
    }

    close() {
        this.isOpen = false
        this.displayEntity = null
        this.tooltip.clear()
    }

    open(recipes: CraftingRecipeCategory[], mode: CraftMode = "craft") {
        requestAnimationFrame(() => {
            this.mode = mode
            this.isOpen = true
            this.recipes = recipes
            this.page = 0
            this.selectCategory(0)
        })
    }

    update(updateData: UpdateData) {
        if (controls.isCloseMenuButtonDown() && this.isOpen) {
            this.close()
        }

        if (this.isOpen) {
            if (controls.isTabRightDown()) {
                this.tabRight()
            } else if (controls.isTabLeftDown()) {
                this.tabLeft()
            }

            this.tooltip.clear()
            const category = this.recipes[this.recipeCategory]
            const screenDimensions = Camera.instance.dimensions
            const topLeft = screenDimensions
                .div(2)
                .minus(this.dimensions.div(2))
                .plusY(-TILE_SIZE * 1)
            this.displayEntity = new Entity([
                ...this.renderCategories(topLeft),
                ...this.renderRecipes(topLeft, category.recipes),
            ])

            if (this.justCraftedRow !== -1) {
                // TODO make changeable
                this.tooltip.say(this.mode === "craft" ? "Crafted!" : "Cooked!")
            }
        }
    }

    private tabRight() {
        this.selectCategory(
            this.recipeCategory === this.recipes.length - 1 ? 0 : this.recipeCategory + 1
        )
    }

    private tabLeft() {
        this.selectCategory(
            this.recipeCategory === 0 ? this.recipes.length - 1 : this.recipeCategory - 1
        )
    }

    private selectCategory(category: number) {
        this.recipeCategory = category
        this.selectPage(0)
    }

    selectPage(page: number) {
        super.selectPage(page)
        this.justCraftedRow = -1
    }

    private renderCategories(topLeft: Point): Component[] {
        const components: Component[] = []

        for (let i = 0; i < this.recipes.length; i++) {
            const category = this.recipes[i]
            const position = topLeft.plusX(i * TILE_SIZE * 2)
            const selected = i === this.recipeCategory
            components.push(
                new ClickableUI(
                    `craft-${i}-selected:${selected}`,
                    position.plus(pt(20, 10)),
                    selected,
                    true
                )
            )
            const dims = new Point(2, 2)
            const hovered = Maths.rectContains(
                position,
                dims.times(TILE_SIZE),
                controls.getCursorPos()
            )

            components.push(
                ...NineSlice.makeNineSliceComponents(
                    Tilesets.instance.oneBit.getNineSlice("invBoxNW").map((s) => () => s),
                    dims,
                    { position }
                ).sprites.values()
            )
            const icon = getIconSprite({
                icon: category.icon,
                color: selected || hovered ? COLOR_TEXT_HOVERED : COLOR_TEXT_NOT_HOVERED,
            })
            components.push(
                icon.toComponent(
                    new SpriteTransform(
                        topLeft.plusX(i * TILE_SIZE * 2 + TILE_SIZE / 2).plusY(TILE_SIZE / 2)
                    )
                )
            )

            if (hovered && controls.isMenuClickDown()) {
                UISounds.playClickSound()
                requestAnimationFrame(() => this.selectCategory(i))
            }

            if (hovered) {
                this.tooltip.say(category.name)
            }
        }
        return components
    }

    private canCraft(craftingPlayer: Dude, recipe: CraftingRecipe) {
        return (
            this.justCraftedRow === -1 &&
            craftingPlayer.inventory.canAddItem(recipe.output) &&
            recipe.input.every(
                (input) => craftingPlayer.inventory.getItemCount(input.item) >= input.count
            )
        )
    }

    private renderRecipes(topLeft: Point, recipes: CraftingRecipe[]): Component[] {
        topLeft = topLeft.plusY(TILE_SIZE * 2)

        // draw background
        const { sprites } = NineSlice.makeStretchedNineSliceComponents(
            Tilesets.instance.outdoorTiles.getNineSlice("invBoxFrame"),
            this.dimensions,
            { position: topLeft, depth: UI_SPRITE_DEPTH }
        )
        const clickables: ClickableUI[] = []

        const width = this.innerDimensions.x
        const margin = 4
        const rowHeight = TILE_SIZE + margin * 2
        const innerOffset = this.dimensions.minus(this.innerDimensions).div(2)
        const textOffset = pt(1, 8)

        const renders: RenderMethod[] = [
            new RectRender({
                position: topLeft.plus(this.dimensions.minus(this.innerDimensions).div(2)),
                dimensions: this.innerDimensions,
                color: COLOR_BACKGROUND,
                depth: UI_SPRITE_DEPTH - 1,
            }),
        ]

        const recipeIndexStart = this.page * RECIPES_PER_PAGE

        for (let r = 0; r < Math.min(recipes.length - recipeIndexStart, RECIPES_PER_PAGE); r++) {
            const topLeftRowPos = topLeft.plusX(margin).plusY(rowHeight * r + margin * 2)
            const hovered =
                Maths.rectContains(
                    topLeftRowPos,
                    new Point(this.innerDimensions.x, rowHeight),
                    controls.getCursorPos()
                ) &&
                Maths.rectContains(
                    // within the frame itself
                    topLeft.plus(innerOffset),
                    this.innerDimensions,
                    controls.getCursorPos()
                )

            const recipeIndex = recipeIndexStart + r
            const recipe = recipes[recipeIndex]
            const craftedItem = ITEM_METADATA_MAP[recipe.output]
            const clickableRowKey = `craft-${this.recipeCategory}-${r}`
            clickables.push(
                new ClickableUI(clickableRowKey, topLeftRowPos.plus(pt(14, 5)), false, true)
            )

            // craft the item
            if (hovered && controls.isMenuClickDown()) {
                if (this.canCraft(player(), recipe)) {
                    this.doCraftOnHost(recipe)
                    if (this.mode === "craft") {
                        Sounds.play(CRAFT_NOISE, 0.6)
                    } else {
                        Sounds.play(COOK_NOISE, 0.13)
                    }
                    this.justCraftedRow = r // set this AFTER crafting
                    setTimeout(() => (this.justCraftedRow = -1), 900)
                } else {
                    UISounds.playErrorSound()
                }
            }

            const prefix = craftedItem.description + "\n"
            if (hovered && !this.canCraft(player(), recipe)) {
                if (!player().inventory.canAddItem(recipe.output)) {
                    this.tooltip.say(prefix + "[Inventory full]")
                } else if (
                    recipe.input.some(
                        (input) => player().inventory.getItemCount(input.item) < input.count
                    )
                ) {
                    this.tooltip.say(prefix + "[Need ingredients]")
                }
            } else if (hovered) {
                this.tooltip.say(prefix + `[Click to ${this.mode}]`)
            }

            // craftable item
            // verticalOffset += margin
            const plainIcon = this.getItemIcon(recipe.output)
            let itemColor: Color
            if (hovered) {
                if (r === this.justCraftedRow) {
                    itemColor = COLOR_LACKING_INGREDIENT
                } else {
                    itemColor = COLOR_TEXT_HOVERED
                }
            } else {
                itemColor = COLOR_TEXT_NOT_HOVERED
            }
            const craftedItemIcon = this.tintedIcon(plainIcon, itemColor)
            renders.push(
                craftedItemIcon.toImageRender(
                    SpriteTransform.new({
                        position: topLeftRowPos.plus(pt(margin + 1, margin - 1)),
                        depth: UI_SPRITE_DEPTH,
                    })
                ),
                new TextRender(
                    craftedItem.displayName,
                    topLeftRowPos.plus(textOffset).plusX(TILE_SIZE + margin * 2),
                    TEXT_SIZE,
                    TEXT_FONT,
                    itemColor,
                    UI_SPRITE_DEPTH
                )
            )

            // ingredients
            let offsetFromRight = 0
            for (let i = 0; i < recipe.input.length; i++) {
                const ingr = recipe.input[recipe.input.length - i - 1]
                const ingredientIcon = getIconSprite({
                    icon: this.getItemIcon(ingr.item),
                    color:
                        player().inventory.getItemCount(ingr.item) < ingr.count
                            ? COLOR_LACKING_INGREDIENT
                            : itemColor,
                })
                offsetFromRight += TILE_SIZE + margin
                const ingrPosition = topLeftRowPos.plus(pt(width - offsetFromRight + 1, margin - 1))
                renders.push(
                    ingredientIcon.toImageRender(
                        SpriteTransform.new({
                            position: ingrPosition,
                            depth: UI_SPRITE_DEPTH,
                        })
                    )
                )
                clickables.push(
                    new ClickableUI(
                        `${clickableRowKey}-${i}`,
                        ingrPosition.plus(pt(TILE_SIZE / 2)),
                        false,
                        true
                    )
                )
                if (
                    Maths.rectContains(
                        topLeftRowPos.plus(new Point(width - offsetFromRight, margin / 2)),
                        new Point(TILE_SIZE + margin, TILE_SIZE + margin),
                        controls.getCursorPos()
                    )
                ) {
                    const displayName = ITEM_METADATA_MAP[ingr.item].displayName
                    this.tooltip.say(
                        `${displayName} (${player().inventory.getItemCount(ingr.item)}/${
                            ingr.count
                        })`
                    )
                }
            }

            // draw line
            renders.push(
                new RectRender({
                    position: topLeftRowPos
                        .plus(pt(margin + 1, TILE_SIZE + margin * 2 - 1))
                        .apply(Math.floor),
                    dimensions: pt(this.innerDimensions.x - 2 * margin, 1),
                    color: COLOR_BACKGROUND_BORDER,
                    depth: UI_SPRITE_DEPTH,
                })
            )
        }

        return [
            ...sprites,
            ...clickables,
            new BasicRenderComponent(...renders),
            ...this.renderPageSelection(topLeft, this.dimensions),
        ]
    }

    private doCraftOnHost = clientSyncFn(
        "craft",
        "host-only",
        ({ dudeUUID }, recipe: CraftingRecipe) => {
            const craftingPlayer = Dude.get(dudeUUID)
            if (!this.canCraft(craftingPlayer, recipe)) {
                return "reject"
            }
            recipe.input.forEach((ingr) => {
                craftingPlayer.inventory.removeItem(ingr.item, ingr.count)
            })
            craftingPlayer.inventory.addItem(recipe.output)
        }
    )

    private getItemIcon(item: Item): Icon {
        return ITEM_METADATA_MAP[item].inventoryIcon
    }

    private tintedIcon(icon: Icon, color: Color): StaticSpriteSource {
        return getIconSprite({ icon, color })
    }

    getEntities(): Entity[] {
        return [this.e, this.displayEntity]
    }
}
