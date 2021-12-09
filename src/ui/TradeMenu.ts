import { assets } from "brigsby/dist/Assets"
import { Component } from "brigsby/dist/Component"
import { UpdateData } from "brigsby/dist/Engine"
import { Entity } from "brigsby/dist/Entity"
import { Point } from "brigsby/dist/Point"
import { BasicRenderComponent } from "brigsby/dist/renderer/BasicRenderComponent"
import { ImageRender } from "brigsby/dist/renderer/ImageRender"
import { TextRender } from "brigsby/dist/renderer/TextRender"
import { AnimatedSpriteComponent } from "brigsby/dist/sprites/AnimatedSpriteComponent"
import { NineSlice } from "brigsby/dist/sprites/NineSlice"
import { SpriteTransform } from "brigsby/dist/sprites/SpriteTransform"
import { StaticSpriteSource } from "brigsby/dist/sprites/StaticSpriteSource"
import { Lists } from "brigsby/dist/util/Lists"
import { Maths } from "brigsby/dist/util/Maths"
import { Sounds } from "../audio/Sounds"
import { Dude } from "../characters/Dude"
import { Player } from "../characters/Player"
import { controls } from "../Controls"
import { Camera } from "../cutscenes/Camera"
import { ImageFilters } from "../graphics/ImageFilters"
import { Tilesets, TILE_SIZE } from "../graphics/Tilesets"
import { Inventory } from "../items/Inventory"
import { Item, ITEM_METADATA_MAP } from "../items/Items"
import { saveManager } from "../SaveManager"
import { Color } from "./Color"
import { TEXT_FONT, TEXT_PIXEL_WIDTH, TEXT_SIZE } from "./Text"
import { Tooltip } from "./Tooltip"
import { UIStateManager } from "./UIStateManager"

export enum TradeMode {
    PLAYER_SELLING = "sell",
    PLAYER_BUYING = "buy",
}

export type SalePackage = {
    readonly item: Item
    readonly count: number
    readonly price: number // number of gold
}

const CLINK_NOISES = [
    "audio/rpg/inventory/coin.wav",
    "audio/rpg/inventory/coin2.wav",
    "audio/rpg/inventory/coin3.wav",
]

// this is mostly copied from CraftingMenu and InventoryDisplay
export class TradeMenu extends Component {
    static instance: TradeMenu

    private readonly e: Entity = new Entity([this]) // entity for this component
    private displayEntity: Entity
    private coinEntity: Entity // for the spinny coin in the corner
    private coinsOffset: Point = new Point(7, -11) // for the spinny coin in the corner
    isOpen = false
    private items: SalePackage[]
    private canvas: HTMLCanvasElement
    private context: CanvasRenderingContext2D
    private dimensions = new Point(160, 158)
    private get innerDimensions() {
        return this.dimensions.minus(new Point(10, 14))
    }
    private scrollOffset = 0
    private justSoldRow = -1 // if this is non-negative, this row was just sold and will be highlighted
    private justOpened = false // prevent bug where the mouse is held down immediately
    private tooltip = this.e.addComponent(new Tooltip())
    private tradeMode: TradeMode
    private sourceInventory: Inventory

    constructor() {
        super()
        TradeMenu.instance = this

        this.canvas = document.createElement("canvas")
        this.context = this.canvas.getContext("2d", { alpha: false })

        assets.loadAudioFiles(CLINK_NOISES)
    }

    update(updateData: UpdateData) {
        if (controls.isCloseButtonDown() && this.isOpen) {
            this.close()
        }

        if (this.isOpen) {
            this.tooltip.clear()
            this.tooltip.position = updateData.input.mousePos
            const rowsTall = 6 // will need to change this if dimensions are adjusted
            this.scrollOffset -=
                updateData.input.mouseWheelDeltaY * updateData.elapsedTimeMillis * 0.01
            this.scrollOffset = Math.floor(
                Math.max(
                    Math.min(0, this.scrollOffset),
                    -Math.max(this.items.length, rowsTall) * 24 + this.innerDimensions.y
                )
            )
            this.displayEntity = new Entity(
                this.renderRecipes(updateData, this.getTopLeft(), this.items)
            )
            this.justOpened = false

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
        this.sourceInventory = Player.instance.dude.inventory
    }

    buy(items: SalePackage[]) {
        this.open(items, TradeMode.PLAYER_BUYING)
        return this
    }

    /**
     * @param sourceInventory should be the player inventory if tradeMode=PLAYER_SELLING,
     *                        otherwise should be the storekeeper's inventory
     */
    private open(items: SalePackage[], tradeMode: TradeMode) {
        const longestStr = Lists.maxBy(items.map(this.textForSale), (str) => str.length)
        this.dimensions = new Point(Math.max(160, 75 + longestStr.length * TEXT_PIXEL_WIDTH), 158)
        this.canvas.width = this.innerDimensions.x
        this.canvas.height = this.innerDimensions.y

        this.isOpen = true
        this.items = items
        this.scrollOffset = 0
        this.justOpened = true
        this.tradeMode = tradeMode

        this.coinEntity = new Entity([
            new AnimatedSpriteComponent(
                [Tilesets.instance.dungeonCharacters.getTileSetAnimation("coin_anim", 150)],
                new SpriteTransform(this.getTopLeft().plus(this.coinsOffset))
            ),
        ])
    }

    /**
     * Fluent API for opening buy menu
     */
    from(dude: Dude) {
        this.sourceInventory = dude.inventory
    }

    private getTopLeft() {
        const screenDimensions = Camera.instance.dimensions
        return screenDimensions.div(2).minus(this.dimensions.div(2))
    }

    private getTradeError(sale: SalePackage) {
        const canInteract = this.justSoldRow === -1 && !this.justOpened
        if (!canInteract) {
            return "oh shit" // not shown
        }
        const playerInv = Player.instance.dude.inventory

        if (this.tradeMode === TradeMode.PLAYER_SELLING) {
            if (playerInv.getItemCount(sale.item) < sale.count) {
                return "Not enough resources"
            }
        } else {
            if (!playerInv.canAddItem(sale.item, sale.count)) {
                return "Inventory full"
            } else if (saveManager.getState().coins < sale.price) {
                return "Not enough gold"
            } else if (this.sourceInventory.getItemCount(sale.item) < sale.count) {
                return "Out of stock"
            }
        }
    }

    private renderRecipes(
        updateData: UpdateData,
        topLeft: Point,
        items: SalePackage[]
    ): Component[] {
        const coinCountComponent = new BasicRenderComponent(
            new TextRender(
                `x${saveManager.getState().coins}`,
                new Point(9, 1).plus(topLeft).plus(this.coinsOffset),
                TEXT_SIZE,
                TEXT_FONT,
                Color.YELLOW,
                UIStateManager.UI_SPRITE_DEPTH
            )
        )

        this.context.imageSmoothingEnabled = false // TODO figure out why text is aliased
        this.context.font = `${TEXT_SIZE}px '${TEXT_FONT}'`

        // draw background
        const backgroundTiles = NineSlice.makeStretchedNineSliceComponents(
            Tilesets.instance.outdoorTiles.getNineSlice("invBoxFrame"),
            topLeft,
            this.dimensions
        )
        backgroundTiles[0].transform.depth = UIStateManager.UI_SPRITE_DEPTH
        this.context.fillStyle = Color.RED
        this.context.fillRect(0, 0, this.innerDimensions.x, this.innerDimensions.y)

        const width = this.innerDimensions.x
        const margin = 4
        const rowHeight = TILE_SIZE + margin * 2
        const innerOffset = this.dimensions.minus(this.innerDimensions).div(2)

        const verticalTextOffset = 13
        let verticalOffset = this.scrollOffset

        const shiftedMousePos = updateData.input.mousePos.plusY(-this.scrollOffset)

        for (let r = 0; r < items.length; r++) {
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
                    updateData.input.mousePos
                )

            const sale = items[r]
            const tradeError = this.getTradeError(sale)

            // trade the item
            if (hovered && updateData.input.isMouseDown && !tradeError) {
                Sounds.play(Lists.oneOf(CLINK_NOISES), 0.4)
                this.sourceInventory.removeItem(sale.item, sale.count)
                if (this.tradeMode === TradeMode.PLAYER_SELLING) {
                    saveManager.setState({
                        coins: saveManager.getState().coins + sale.price,
                    })
                } else {
                    Player.instance.dude.inventory.addItem(sale.item, sale.count)
                    saveManager.setState({
                        coins: saveManager.getState().coins - sale.price,
                    })
                }
                this.justSoldRow = r
                setTimeout(() => (this.justSoldRow = -1), 900)
            }

            if (hovered && tradeError) {
                this.tooltip.say(tradeError)
            } else if (hovered) {
                const totalCount = this.sourceInventory.getItemCount(sale.item)
                this.tooltip.say(`Click to ${this.tradeMode} ${sale.count}/${totalCount}`)
            }

            // craftable item
            verticalOffset += margin
            const plainIcon = this.getItemIcon(sale.item)
            let itemColor: Color = Color.PINK
            if (hovered) {
                if (r === this.justSoldRow) {
                    itemColor = Color.DARK_RED
                } else if (!tradeError) {
                    itemColor = Color.WHITE
                }
            }
            if (tradeError) {
                itemColor = Color.DARK_RED
            }
            this.context.fillStyle = itemColor
            const craftedItemIcon = this.tintedIcon(plainIcon, itemColor)
            this.drawIconAt(craftedItemIcon, margin, verticalOffset)
            this.context.fillText(
                this.textForSale(sale),
                TILE_SIZE + margin * 2,
                verticalTextOffset + verticalOffset
            )

            // coinage
            let offsetFromRight = 0
            const coinIcon = this.getItemIcon(Item.COIN)
            let ingredientIcon: StaticSpriteSource = this.tintedIcon(
                coinIcon,
                itemColor === Color.WHITE ? Color.YELLOW : itemColor
            ) // make coin icon yellow on hover
            this.context.fillStyle = itemColor
            const countStr = `${sale.price}`
            offsetFromRight += countStr.length * TEXT_PIXEL_WIDTH + margin
            this.context.fillText(
                countStr,
                width - offsetFromRight,
                verticalTextOffset + verticalOffset
            )
            offsetFromRight += TILE_SIZE
            this.drawIconAt(ingredientIcon, width - offsetFromRight, verticalOffset)

            // draw line
            verticalOffset += margin + TILE_SIZE
            this.context.fillStyle = Color.DARK_RED
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

        return [...backgroundTiles, renderComp, coinCountComponent]
    }

    private textForSale(sale: SalePackage) {
        return `${sale.count}x ${ITEM_METADATA_MAP[sale.item].displayName}`
    }

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
        if (tint === Color.WHITE) {
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
        return [this.e, this.displayEntity, this.coinEntity]
    }
}
