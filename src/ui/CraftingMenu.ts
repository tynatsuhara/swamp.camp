import { Component, Entity, Point, UpdateData } from "brigsby/dist"
import { BasicRenderComponent, ImageRender } from "brigsby/dist/renderer"
import { NineSlice, SpriteTransform, StaticSpriteSource } from "brigsby/dist/sprites"
import { Maths } from "brigsby/dist/util"
import { loadAudio } from "../audio/DeferLoadAudio"
import { Sounds } from "../audio/Sounds"
import { Dude } from "../characters/Dude"
import { player } from "../characters/player"
import { controls } from "../Controls"
import { Camera } from "../cutscenes/Camera"
import { ImageFilters } from "../graphics/ImageFilters"
import { Tilesets, TILE_SIZE } from "../graphics/Tilesets"
import { CraftingRecipe, CraftingRecipeCategory } from "../items/CraftingRecipe"
import { Item, ITEM_METADATA_MAP } from "../items/Items"
import { session } from "../online/session"
import { clientSyncFn } from "../online/utils"
import { here } from "../world/locations/LocationManager"
import { Color } from "./Color"
import { TEXT_FONT, TEXT_SIZE } from "./Text"
import { Tooltip } from "./Tooltip"
import { UISounds } from "./UISounds"
import { UIStateManager } from "./UIStateManager"

const COLOR_TEXT_HOVERED = Color.WHITE
const COLOR_BACKGROUND = Color.RED_2
const COLOR_BACKGROUND_BORDER = Color.RED_1
const COLOR_TEXT_NOT_HOVERED = Color.PINK_3
const COLOR_LACKING_INGREDIENT = Color.RED_1

export class CraftingMenu extends Component {
    static instance: CraftingMenu

    private readonly e: Entity = new Entity([this]) // entity for this component
    private displayEntity: Entity
    isOpen = false
    private recipes: CraftingRecipeCategory[]
    private recipeCategory: number
    private canvas: HTMLCanvasElement
    private context: CanvasRenderingContext2D
    private dimensions = new Point(160, 158)
    private innerDimensions = this.dimensions.minus(new Point(10, 14))
    private scrollOffset = 0
    private justCraftedRow = -1 // if this is non-negative, this row was just crafted and will be highlighted
    private justOpened = false // prevent bug where the mouse is held down immediately
    private tooltip = this.e.addComponent(new Tooltip())
    private readonly craftNoise = "audio/rpg/inventory/metal-small3.wav"

    constructor() {
        super()
        CraftingMenu.instance = this

        this.canvas = document.createElement("canvas")
        this.canvas.width = this.innerDimensions.x
        this.canvas.height = this.innerDimensions.y
        this.context = this.canvas.getContext("2d", { alpha: false })

        loadAudio([this.craftNoise])
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
            this.tooltip.position = controls.getMousePos()
            const rowsTall = 6 // will need to change this if dimensions are adjusted
            const category = this.recipes[this.recipeCategory]
            this.scrollOffset -=
                controls.getScrollDeltaY() *
                updateData.elapsedTimeMillis *
                UIStateManager.SCROLL_SPEED
            this.scrollOffset = Maths.clamp(
                this.scrollOffset,
                -Math.max(category.recipes.length, rowsTall) * 24 + this.innerDimensions.y,
                0
            )
            const screenDimensions = Camera.instance.dimensions
            const topLeft = screenDimensions.div(2).minus(this.dimensions.div(2)).plusY(-TILE_SIZE)
            this.displayEntity = new Entity([
                ...this.renderCategories(topLeft),
                ...this.renderRecipes(topLeft, category.recipes),
            ])
            this.justOpened = false

            if (this.justCraftedRow !== -1) {
                this.tooltip.say("Crafted!")
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

    close() {
        this.isOpen = false
        this.displayEntity = null
        this.tooltip.clear()
    }

    open(recipes: CraftingRecipeCategory[]) {
        this.isOpen = true
        this.recipes = recipes
        this.scrollOffset = 0
        this.justOpened = true
        this.selectCategory(0)
    }

    private selectCategory(category: number) {
        this.recipeCategory = category
        this.justCraftedRow = -1
    }

    private renderCategories(topLeft: Point): Component[] {
        const result: Component[] = []
        for (let i = 0; i < this.recipes.length; i++) {
            const category = this.recipes[i]
            const position = topLeft.plusX(i * TILE_SIZE * 2)
            const dims = new Point(2, 2)
            const hovered = Maths.rectContains(
                position,
                dims.times(TILE_SIZE),
                controls.getMousePos()
            )

            result.push(
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
            result.push(
                icon.toComponent(
                    new SpriteTransform(
                        topLeft.plusX(i * TILE_SIZE * 2 + TILE_SIZE / 2).plusY(TILE_SIZE / 2)
                    )
                )
            )

            if (!this.justOpened && hovered && controls.isMenuClickDown()) {
                UISounds.playClickSound()
                this.selectCategory(i)
            }

            if (hovered) {
                this.tooltip.say(category.name)
            }
        }
        return result
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

        this.context.imageSmoothingEnabled = false // TODO figure out why text is aliased
        this.context.font = `${TEXT_SIZE}px '${TEXT_FONT}'`

        // draw background
        const { sprites } = NineSlice.makeStretchedNineSliceComponents(
            Tilesets.instance.outdoorTiles.getNineSlice("invBoxFrame"),
            this.dimensions,
            { position: topLeft, depth: UIStateManager.UI_SPRITE_DEPTH }
        )
        this.context.fillStyle = COLOR_BACKGROUND
        this.context.fillRect(0, 0, this.innerDimensions.x, this.innerDimensions.y)

        const width = this.innerDimensions.x
        const margin = 4
        const rowHeight = TILE_SIZE + margin * 2
        const innerOffset = this.dimensions.minus(this.innerDimensions).div(2)

        const verticalTextOffset = 13
        let verticalOffset = this.scrollOffset

        const shiftedMousePos = controls.getMousePos().plusY(-this.scrollOffset)

        for (let r = 0; r < recipes.length; r++) {
            const hovered =
                Maths.rectContains(
                    topLeft.plusX(margin).plusY(rowHeight * r + margin * 2),
                    new Point(this.innerDimensions.x, rowHeight),
                    shiftedMousePos
                ) &&
                Maths.rectContains(
                    // within the frame itself
                    topLeft.plus(innerOffset),
                    this.innerDimensions,
                    controls.getMousePos()
                )

            const recipe = recipes[r]
            const craftedItem = ITEM_METADATA_MAP[recipe.output]

            // craft the item
            if (hovered && controls.isMenuClickDown()) {
                if (this.canCraft(player(), recipe)) {
                    this.doCraftOnHost(player().uuid, recipe)
                    Sounds.play(this.craftNoise, 0.6)
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
                this.tooltip.say(prefix + "[Click to craft]")
            }

            // craftable item
            verticalOffset += margin
            const plainIcon = this.getItemIcon(recipe.output)
            let craftedItemColor: Color
            if (hovered) {
                if (r === this.justCraftedRow) {
                    craftedItemColor = COLOR_LACKING_INGREDIENT
                } else {
                    craftedItemColor = COLOR_TEXT_HOVERED
                }
            } else {
                craftedItemColor = COLOR_TEXT_NOT_HOVERED
            }
            this.context.fillStyle = craftedItemColor
            const craftedItemIcon = this.tintedIcon(plainIcon, craftedItemColor)
            this.drawIconAt(craftedItemIcon, margin, verticalOffset)
            this.context.fillText(
                craftedItem.displayName,
                TILE_SIZE + margin * 2,
                verticalTextOffset + verticalOffset
            )

            // ingredients
            let offsetFromRight = 0
            for (let i = 0; i < recipe.input.length; i++) {
                const ingr = recipe.input[recipe.input.length - i - 1]
                const plainIngredientIcon = this.getItemIcon(ingr.item)
                let ingredientIcon: StaticSpriteSource = plainIngredientIcon
                if (player().inventory.getItemCount(ingr.item) < ingr.count) {
                    this.context.fillStyle = COLOR_LACKING_INGREDIENT
                    ingredientIcon = this.tintedIcon(ingredientIcon, COLOR_LACKING_INGREDIENT)
                } else {
                    this.context.fillStyle = craftedItemColor
                    ingredientIcon = this.tintedIcon(plainIngredientIcon, craftedItemColor)
                }
                // const requiredCount = ingr.count
                // const countStr = `x${requiredCount}`
                // offsetFromRight += (countStr.length * TEXT_PIXEL_WIDTH + margin)
                // this.context.fillText(countStr, width - offsetFromRight, verticalTextOffset + verticalOffset)
                offsetFromRight += TILE_SIZE + margin
                this.drawIconAt(ingredientIcon, width - offsetFromRight, verticalOffset)
                if (
                    Maths.rectContains(
                        // I have no idea why this math works :(
                        new Point(
                            width - offsetFromRight + margin,
                            verticalOffset + margin * 1.5
                        ).plus(topLeft),
                        new Point(TILE_SIZE + margin, TILE_SIZE + margin),
                        controls.getMousePos()
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
            verticalOffset += margin + TILE_SIZE
            this.context.fillStyle = COLOR_BACKGROUND_BORDER
            this.context.fillRect(margin, verticalOffset, this.innerDimensions.x - 2 * margin, 1)
        }

        const renderComp = new BasicRenderComponent(
            new ImageRender(
                this.canvas,
                Point.ZERO,
                this.innerDimensions,
                innerOffset.plus(topLeft).apply(Math.floor),
                this.innerDimensions,
                UIStateManager.UI_SPRITE_DEPTH - 10
            )
        )

        return [...sprites, renderComp]
    }

    private doCraftOnHost = clientSyncFn(
        "craft",
        // MPTODO use dudeUUID
        ({ trusted }, craftingPlayerUUID: string, recipe: CraftingRecipe) => {
            if (session.isHost()) {
                const craftingPlayer = here()
                    .getDudes()
                    .find((d) => d.uuid === craftingPlayerUUID)
                if (!this.canCraft(craftingPlayer, recipe)) {
                    return "reject"
                }
                recipe.input.forEach((ingr) => {
                    craftingPlayer.inventory.removeItem(ingr.item, ingr.count)
                })
                craftingPlayer.inventory.addItem(recipe.output)
            }
        }
    )

    // caching stuff
    private itemIcons = new Map<Item, StaticSpriteSource>()
    private tintedIcons = new Map<string, Map<StaticSpriteSource, StaticSpriteSource>>()

    private drawIconAt(icon: StaticSpriteSource, x: number, y: number) {
        this.context.drawImage(
            icon.image,
            icon.position.x,
            icon.position.y,
            icon.dimensions.x,
            icon.dimensions.y,
            x,
            y,
            icon.dimensions.x,
            icon.dimensions.y
        )
    }

    private getItemIcon(item: Item): StaticSpriteSource {
        const cached = this.itemIcons.get(item)
        if (!!cached) {
            return cached
        }
        const icon = ITEM_METADATA_MAP[item].inventoryIconSupplier()
        this.itemIcons.set(item, icon)
        return icon
    }

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
