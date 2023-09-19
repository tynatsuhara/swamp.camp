import { Component, Entity, Point, UpdateData, pt } from "brigsby/dist"
import { BasicRenderComponent, RectRender, RenderMethod, TextRender } from "brigsby/dist/renderer"
import { NineSlice, SpriteTransform, StaticSpriteSource } from "brigsby/dist/sprites"
import { Lists, Maths } from "brigsby/dist/util"
import { Dude } from "../characters/Dude"
import { player } from "../characters/player"
import { controls } from "../core/Controls"
import { saveManager } from "../core/SaveManager"
import { Singletons } from "../core/Singletons"
import { Camera } from "../cutscenes/Camera"
import { Icon } from "../graphics/OneBitTileset"
import { TILE_SIZE, Tilesets } from "../graphics/Tilesets"
import { Inventory } from "../items/Inventory"
import { Item } from "../items/Item"
import { ITEM_METADATA_MAP } from "../items/Items"
import { ClickableUI } from "./ClickableUI"
import { Color } from "./Color"
import { getGoldCountComponents } from "./GoldCountComponents"
import { getIconSprite } from "./IconSprite"
import { PaginatedMenu } from "./PaginatedMenu"
import { TEXT_FONT, TEXT_PIXEL_WIDTH, TEXT_SIZE } from "./Text"
import { Tooltip } from "./Tooltip"
import { UISounds } from "./UISounds"
import { UI_SPRITE_DEPTH } from "./UiConstants"

export enum TradeMode {
    PLAYER_SELLING = "sell",
    PLAYER_BUYING = "buy",
}

export type SalePackage = {
    readonly item: Item
    readonly count: number
    readonly price: number // number of gold
}

const COLOR_BACKGROUND = Color.RED_2
const COLOR_BACKGROUND_BORDER = Color.RED_1
const COLOR_TEXT_NOT_HOVERED = Color.PINK_3
const COLOR_ERROR = Color.RED_1
const ROWS_PER_PAGE = 5

// this is mostly copied from CraftingMenu and InventoryDisplay
export class TradeMenu extends PaginatedMenu {
    static get instance() {
        return Singletons.getOrCreate(TradeMenu)
    }

    private readonly e: Entity = new Entity([this]) // entity for this component
    private displayEntity: Entity
    private coinEntity: Entity // for the spinny coin in the corner
    private coinsOffset: Point = new Point(7, -11) // for the spinny coin in the corner
    isOpen = false
    private items: SalePackage[]
    private dimensions: Point
    private get innerDimensions() {
        return this.dimensions.minus(new Point(10, 14))
    }
    private justSoldRow = -1 // if this is non-negative, this row was just sold and will be highlighted
    private tooltip = this.e.addComponent(new Tooltip())
    private tradeMode: TradeMode
    private sourceInventory: Inventory
    get pages() {
        return Math.ceil(this.items.length / ROWS_PER_PAGE)
    }

    update(updateData: UpdateData) {
        if (controls.isCloseMenuButtonDown() && this.isOpen) {
            this.close()
        }

        if (this.isOpen) {
            this.tooltip.clear()
            this.displayEntity = new Entity(this.renderRecipes(this.getTopLeft(), this.items))

            if (this.justSoldRow !== -1) {
                this.tooltip.say(
                    this.tradeMode === TradeMode.PLAYER_SELLING ? "Sold!" : "Purchased!"
                )
            }
        }
    }

    close() {
        this.isOpen = false
        this.displayEntity = null
        this.coinEntity = null
        this.tooltip.clear()
    }

    sell(items: SalePackage[]) {
        this.open(items, TradeMode.PLAYER_SELLING)
        this.sourceInventory = player().inventory
    }

    buy(items: SalePackage[], seller?: Dude) {
        this.open(items, TradeMode.PLAYER_BUYING)
        this.sourceInventory = seller?.inventory
        return this
    }

    private open(items: SalePackage[], tradeMode: TradeMode) {
        requestAnimationFrame(() => {
            this.items = items
            this.tradeMode = tradeMode

            const longestStr = Lists.maxBy(
                items.map((it) => this.textForSale(it)),
                (str) => str.length
            )
            this.dimensions = new Point(
                Math.max(160, 75 + longestStr.length * TEXT_PIXEL_WIDTH),
                153
            )

            this.isOpen = true
            this.coinEntity = new Entity(
                getGoldCountComponents(this.getTopLeft().plus(this.coinsOffset))
            )
        })
    }

    private getTopLeft() {
        const screenDimensions = Camera.instance.dimensions
        return screenDimensions.div(2).minus(this.dimensions.div(2))
    }

    private getTradeError(sale: SalePackage) {
        const canInteract = this.justSoldRow === -1
        if (!canInteract) {
            return "oh shit" // not shown
        }
        const playerInv = player().inventory

        if (this.tradeMode === TradeMode.PLAYER_SELLING) {
            if (playerInv.getItemCount(sale.item) < sale.count) {
                return "Not enough resources"
            }
        } else {
            if (!playerInv.canAddItem(sale.item, sale.count)) {
                return "Inventory full"
            } else if (saveManager.getState().coins < sale.price) {
                return "Not enough gold"
            } else if (this.sourceInventory?.getItemCount(sale.item) < sale.count) {
                return "Out of stock"
            }
        }
    }

    private renderRecipes(topLeft: Point, items: SalePackage[]): Component[] {
        const clickables: ClickableUI[] = []

        // draw background
        const { sprites: bgSprites } = NineSlice.makeStretchedNineSliceComponents(
            Tilesets.instance.outdoorTiles.getNineSlice("invBoxFrame"),
            this.dimensions,
            { position: topLeft, depth: UI_SPRITE_DEPTH }
        )

        const renders: RenderMethod[] = [
            new RectRender({
                position: topLeft.plus(this.dimensions.minus(this.innerDimensions).div(2)),
                dimensions: this.innerDimensions,
                color: COLOR_BACKGROUND,
                depth: UI_SPRITE_DEPTH - 1,
            }),
        ]

        const width = this.innerDimensions.x
        const margin = 4
        const rowHeight = TILE_SIZE + margin * 2
        const innerOffset = this.dimensions.minus(this.innerDimensions).div(2)
        const textOffset = pt(1, 8)
        items = items.slice(this.page * ROWS_PER_PAGE, this.page * ROWS_PER_PAGE + ROWS_PER_PAGE)

        for (let r = 0; r < items.length; r++) {
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

            clickables.push(
                new ClickableUI(`trade-${r}`, topLeftRowPos.plus(pt(14, 5)), r === 0, true)
            )

            const sale = items[r]
            const tradeError = this.getTradeError(sale)

            // trade the item
            if (hovered && controls.isMenuClickDown() && !tradeError) {
                UISounds.playMoneySound()
                this.sourceInventory?.removeItem(sale.item, sale.count)
                if (this.tradeMode === TradeMode.PLAYER_SELLING) {
                    saveManager.setState({
                        coins: saveManager.getState().coins + sale.price,
                    })
                } else {
                    player().inventory.addItem(sale.item, sale.count)
                    saveManager.setState({
                        coins: saveManager.getState().coins - sale.price,
                    })
                }
                this.justSoldRow = r
                setTimeout(() => (this.justSoldRow = -1), 900)
            }

            if (hovered && tradeError) {
                this.tooltip.say(`[${tradeError}]`)
            } else if (hovered) {
                const totalCount = this.sourceInventory?.getItemCount(sale.item)
                const countText = this.sourceInventory ? ` ${sale.count}/${totalCount}` : ""
                this.tooltip.say(`[Click to ${this.tradeMode}${countText}]`)
            }

            // craftable item
            const plainIcon = this.getItemIcon(sale.item)
            let itemColor: Color = COLOR_TEXT_NOT_HOVERED
            if (hovered) {
                if (r === this.justSoldRow) {
                    itemColor = COLOR_ERROR
                } else if (!tradeError) {
                    itemColor = Color.WHITE
                }
            }
            if (tradeError) {
                itemColor = COLOR_ERROR
            }
            const craftedItemIcon = this.tintedIcon(plainIcon, itemColor)
            // item title and icon
            renders.push(
                craftedItemIcon.toImageRender(
                    SpriteTransform.new({
                        position: topLeftRowPos.plus(pt(margin + 1, margin - 1)),
                        depth: UI_SPRITE_DEPTH,
                    })
                ),
                new TextRender(
                    this.textForSale(sale),
                    topLeftRowPos.plusX(TILE_SIZE + margin * 2).plus(textOffset),
                    TEXT_SIZE,
                    TEXT_FONT,
                    itemColor,
                    UI_SPRITE_DEPTH
                )
            )

            // coinage
            const coinIcon = this.getItemIcon(Item.COIN)
            const tintedCoinIcon: StaticSpriteSource = this.tintedIcon(
                coinIcon,
                itemColor === Color.WHITE ? Color.RED_6 : itemColor
            ) // make coin icon yellow on hover
            const countStr = `${sale.price}`
            const textOffsetFromRight = countStr.length * TEXT_PIXEL_WIDTH + margin
            const iconOffsetFromRight = textOffsetFromRight + TILE_SIZE
            renders.push(
                new TextRender(
                    countStr,
                    topLeftRowPos.plus(pt(width - textOffsetFromRight, 0)).plus(textOffset),
                    TEXT_SIZE,
                    TEXT_FONT,
                    itemColor,
                    UI_SPRITE_DEPTH
                ),
                tintedCoinIcon.toImageRender(
                    SpriteTransform.new({
                        position: topLeftRowPos.plus(pt(width - iconOffsetFromRight, margin - 1)),
                        depth: UI_SPRITE_DEPTH,
                    })
                )
            )

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
            ...bgSprites,
            new BasicRenderComponent(...renders),
            ...clickables,
            ...this.renderPageSelection(topLeft, this.dimensions),
        ]
    }

    private textForSale(sale: SalePackage) {
        const countPrefix = this.tradeMode === TradeMode.PLAYER_BUYING ? "" : `${sale.count}x `
        return `${countPrefix}${ITEM_METADATA_MAP[sale.item].displayName}`
    }

    selectPage(page: number) {
        this.justSoldRow = -1
        super.selectPage(page)
    }

    private getItemIcon(item: Item): Icon {
        return ITEM_METADATA_MAP[item].inventoryIcon
    }

    // todo replace with cache
    private tintedIcon(icon: Icon, color: Color): StaticSpriteSource {
        return getIconSprite({ icon, color })
    }

    getEntities(): Entity[] {
        return [this.e, this.displayEntity, this.coinEntity]
    }
}
