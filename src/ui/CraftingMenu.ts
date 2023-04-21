import { Component, Entity, Point, pt, UpdateData } from "brigsby/dist"
import { BasicRenderComponent, RectRender, RenderMethod, TextRender } from "brigsby/dist/renderer"
import { NineSlice, SpriteTransform, StaticSpriteSource } from "brigsby/dist/sprites"
import { Maths } from "brigsby/dist/util"
import { loadAudio } from "../audio/DeferLoadAudio"
import { Sounds } from "../audio/Sounds"
import { Dude } from "../characters/Dude"
import { player } from "../characters/player"
import { controls } from "../Controls"
import { Camera } from "../cutscenes/Camera"
import { ImageFilters } from "../graphics/ImageFilters"
import { TILE_SIZE, Tilesets } from "../graphics/Tilesets"
import {
    CraftingRecipe,
    CraftingRecipeCategory,
    getWorkbenchRecipes,
} from "../items/CraftingRecipe"
import { Item } from "../items/Item"
import { ITEM_METADATA_MAP } from "../items/Items"
import { clientSyncFn } from "../online/syncUtils"
import { Singletons } from "../Singletons"
import { EventDispatcher } from "../utils/EventDispatcher"
import { ClickableUI } from "./ClickableUI"
import { Color } from "./Color"
import { getIconSpriteImageRender } from "./IconSprite"
import { formatText, TEXT_FONT, TEXT_SIZE, TextAlign } from "./Text"
import { Tooltip } from "./Tooltip"
import { UI_SPRITE_DEPTH } from "./UiConstants"
import { UISounds } from "./UISounds"

const COLOR_TEXT_HOVERED = Color.WHITE
const COLOR_BACKGROUND = Color.RED_2
const COLOR_BACKGROUND_BORDER = Color.RED_1
const COLOR_TEXT_NOT_HOVERED = Color.PINK_3
const COLOR_LACKING_INGREDIENT = Color.RED_1
const RECIPES_PER_PAGE = 6

const CRAFT_NOISE = "audio/rpg/inventory/metal-small3.wav"
const COOK_NOISE = "audio/misc/cc0-fireball-01.wav"
loadAudio([CRAFT_NOISE, COOK_NOISE])

type CraftMode = "craft" | "cook"

export class CraftingMenu extends Component {
    static get instance() {
        return Singletons.getOrCreate(CraftingMenu)
    }

    private readonly e: Entity = new Entity([this]) // entity for this component
    private displayEntity: Entity
    isOpen = false
    private recipes: CraftingRecipeCategory[]
    private recipeCategory: number
    private page: number = 0
    private dimensions = new Point(160, 177)
    private innerDimensions = this.dimensions.minus(new Point(10, 14))
    private justCraftedRow = -1 // if this is non-negative, this row was just crafted and will be highlighted
    private justOpened = false // prevent bug where the mouse is held down immediately
    private tooltip = this.e.addComponent(new Tooltip())
    private mode: CraftMode

    private get pages() {
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
        this.mode = mode
        this.isOpen = true
        this.recipes = recipes
        this.page = 0
        this.justOpened = true
        this.selectCategory(0)
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
            const topLeft = screenDimensions.div(2).minus(this.dimensions.div(2)).plusY(-TILE_SIZE)
            this.displayEntity = new Entity([
                ...this.renderCategories(topLeft),
                ...this.renderRecipes(topLeft, category.recipes),
            ])
            this.justOpened = false

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

    private selectPage(page: number) {
        this.justCraftedRow = -1
        this.page = page
    }

    private renderCategories(topLeft: Point): Component[] {
        const components: Component[] = []

        for (let i = 0; i < this.recipes.length; i++) {
            const category = this.recipes[i]
            const position = topLeft.plusX(i * TILE_SIZE * 2)
            components.push(new ClickableUI(`craft-${i}`, position.plus(pt(20)), false, true))
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
            const icon =
                i === this.recipeCategory || hovered
                    ? category.icon
                    : this.tintedIcon(category.icon, COLOR_TEXT_NOT_HOVERED)
            components.push(
                icon.toComponent(
                    new SpriteTransform(
                        topLeft.plusX(i * TILE_SIZE * 2 + TILE_SIZE / 2).plusY(TILE_SIZE / 2)
                    )
                )
            )

            if (!this.justOpened && hovered && controls.isMenuClickDown()) {
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
            !this.justOpened &&
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
            clickables.push(
                new ClickableUI(`craft-${this.recipeCategory}-${r}`, topLeftRowPos, false, true)
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

            const prefix = recipe.desc + "\n"
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
                const plainIngredientIcon = this.getItemIcon(ingr.item)
                let ingredientIcon: StaticSpriteSource = plainIngredientIcon
                if (player().inventory.getItemCount(ingr.item) < ingr.count) {
                    ingredientIcon = this.tintedIcon(ingredientIcon, COLOR_LACKING_INGREDIENT)
                } else {
                    ingredientIcon = this.tintedIcon(plainIngredientIcon, itemColor)
                }
                offsetFromRight += TILE_SIZE + margin
                renders.push(
                    ingredientIcon.toImageRender(
                        SpriteTransform.new({
                            position: topLeftRowPos.plus(
                                pt(width - offsetFromRight + 1, margin - 1)
                            ),
                            depth: UI_SPRITE_DEPTH,
                        })
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

        const buttonOffsetX = 14
        const buttonOffsetY = 16
        const pageLeftButtonCenterPos = topLeft
            .plus(pt(buttonOffsetX, this.dimensions.y - buttonOffsetY))
            .apply(Math.floor)
        const pageRightButtonCenterPos = topLeft
            .plus(pt(this.dimensions.x - buttonOffsetX, this.dimensions.y - buttonOffsetY))
            .apply(Math.floor)
        renders.push(
            ...formatText({
                text: `${this.page + 1}/${this.pages}`,
                position: topLeft.plusY(this.dimensions.y - 20),
                width: this.dimensions.x,
                alignment: TextAlign.CENTER,
                color: COLOR_TEXT_NOT_HOVERED,
            })
        )

        return [
            ...sprites,
            ...clickables,
            new BasicRenderComponent(...renders),
            ...this.renderPageButton(pageLeftButtonCenterPos, this.page > 0, "left"),
            ...this.renderPageButton(pageRightButtonCenterPos, this.page < this.pages - 1, "right"),
        ]
    }

    private renderPageButton(
        centerPos: Point,
        active: boolean,
        key: "left" | "right"
    ): Component[] {
        const isHovering = Maths.rectContains(
            centerPos.minus(pt(TILE_SIZE / 2)),
            pt(TILE_SIZE),
            controls.getCursorPos()
        )
        const activeColor = isHovering ? COLOR_TEXT_HOVERED : COLOR_TEXT_NOT_HOVERED
        const render = getIconSpriteImageRender({
            icon: `small_arrow_${key}`,
            centerPos,
            color: active ? activeColor : COLOR_LACKING_INGREDIENT,
        })
        if (controls.isMenuClickDown() && isHovering && active) {
            this.selectPage(key === "left" ? this.page - 1 : this.page + 1)
        }
        return [
            new BasicRenderComponent(render),
            new ClickableUI(`craft-${key}`, centerPos, false, true),
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

    // caching stuff
    private itemIcons = new Map<Item, StaticSpriteSource>()
    private tintedIcons = new Map<string, Map<StaticSpriteSource, StaticSpriteSource>>()

    private getItemIcon(item: Item): StaticSpriteSource {
        const cached = this.itemIcons.get(item)
        if (!!cached) {
            return cached
        }
        const icon = ITEM_METADATA_MAP[item].inventoryIconSupplier()
        this.itemIcons.set(item, icon)
        return icon
    }

    // TODO replace with getIconSprite
    private tintedIcon(icon: StaticSpriteSource, tint: Color): StaticSpriteSource {
        if (tint === COLOR_TEXT_HOVERED) {
            return icon
        }
        let cache = this.tintedIcons.get(tint)
        if (!cache) {
            cache = new Map<StaticSpriteSource, StaticSpriteSource>()
            this.tintedIcons.set(tint, cache)
        }
        const cached = cache.get(icon)
        if (!!cached) {
            return cached
        }
        const f = icon.filtered(ImageFilters.tint(tint))
        cache.set(icon, f)
        return f
    }

    getEntities(): Entity[] {
        return [this.e, this.displayEntity]
    }
}
