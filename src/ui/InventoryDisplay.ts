import { Component } from "brigsby/dist/Component"
import { UpdateData } from "brigsby/dist/Engine"
import { Entity } from "brigsby/dist/Entity"
import { InputKeyString } from "brigsby/dist/Input"
import { Point } from "brigsby/dist/Point"
import { BasicRenderComponent } from "brigsby/dist/renderer/BasicRenderComponent"
import { TextRender } from "brigsby/dist/renderer/TextRender"
import { AnimatedSpriteComponent } from "brigsby/dist/sprites/AnimatedSpriteComponent"
import { NineSlice } from "brigsby/dist/sprites/NineSlice"
import { SpriteComponent } from "brigsby/dist/sprites/SpriteComponent"
import { SpriteTransform } from "brigsby/dist/sprites/SpriteTransform"
import { Player } from "../characters/Player"
import { ShieldType } from "../characters/weapons/ShieldType"
import { WeaponType } from "../characters/weapons/WeaponType"
import { Controls } from "../Controls"
import { Camera } from "../cutscenes/Camera"
import { Tilesets, TILE_SIZE } from "../graphics/Tilesets"
import { Inventory } from "../items/Inventory"
import { Item, ITEM_METADATA_MAP } from "../items/Items"
import { saveManager } from "../SaveManager"
import { Elements } from "../world/elements/Elements"
import { LocationManager } from "../world/LocationManager"
import { Color } from "./Color"
import { PlaceElementDisplay } from "./PlaceElementDisplay"
import { TEXT_FONT, TEXT_SIZE } from "./Text"
import { Tooltip } from "./Tooltip"
import { UIStateManager } from "./UIStateManager"

export class InventoryDisplay extends Component {
    static instance: InventoryDisplay

    private static COLUMNS = 10

    private readonly e: Entity = new Entity() // entity for this component
    private displayEntity: Entity
    private trackedTileInventory: Inventory
    private trackedTileIndex: number
    private trackedTile: SpriteComponent // non-null when being dragged
    private lastMousPos: Point
    private tiles: SpriteComponent[] = []
    private showingInv = false
    get isOpen() {
        return this.showingInv
    }
    private offset: Point
    private tooltip: Tooltip
    private readonly coinsOffset = new Point(0, -18)
    private onClose: () => void
    private tradingInv: Inventory
    private tradingInvOffset: Point
    private canUseItems = false

    constructor() {
        super()
        this.e.addComponent(this)
        this.tooltip = this.e.addComponent(new Tooltip())
        InventoryDisplay.instance = this
    }

    get playerInv() {
        return Player.instance.dude.inventory
    }

    lateUpdate(updateData: UpdateData) {
        const pressI = Controls.isInventoryButtonDown(updateData.input)
        const pressEsc = Controls.isCloseButtonDown(updateData.input)

        if (this.isOpen && (pressI || pressEsc)) {
            this.close()
        } else if (pressI && !UIStateManager.instance.isMenuOpen) {
            this.open()
        }

        if (!this.isOpen) {
            return
        }

        const refreshView = () => this.open(this.onClose, this.tradingInv)
        const canRemoveFromPlayerInv = (item: Item) => {
            if (this.playerInv.getItemCount(item) === 1) {
                // unequip equipped weapons
                const weapon: WeaponType = WeaponType[WeaponType[item]]
                if (!!weapon && Player.instance.dude.weaponType === weapon) {
                    return false
                }

                // unequip equipped shields
                const shield: ShieldType = ShieldType[ShieldType[item]]
                if (!!shield && Player.instance.dude.shieldType === shield) {
                    return false
                }
            }
            return true
        }

        const hoverResult = this.getHoveredInventoryIndex(updateData.input.mousePos)
        const hoverInv = hoverResult[0]
        const hoverIndex = hoverResult[1]

        if (!!this.trackedTile) {
            // dragging
            this.tooltip.clear()
            if (updateData.input.isMouseUp) {
                // drop n swap
                if (hoverIndex !== -1) {
                    // Swap the stacks
                    const draggedValue = this.trackedTileInventory.getStack(this.trackedTileIndex)

                    // Swap the stacks
                    if (hoverInv === this.playerInv || canRemoveFromPlayerInv(draggedValue.item)) {
                        const currentlyOccupiedSpotValue = hoverInv.getStack(hoverIndex)
                        hoverInv.setStack(hoverIndex, draggedValue)
                        this.trackedTileInventory.setStack(
                            this.trackedTileIndex,
                            currentlyOccupiedSpotValue
                        )
                    }
                }

                this.trackedTileInventory = null
                this.trackedTile = null

                refreshView()
            } else {
                // track
                this.trackedTile.transform.position = this.trackedTile.transform.position.plus(
                    updateData.input.mousePos.minus(this.lastMousPos)
                )
            }
        } else if (hoverIndex > -1 && !!hoverInv.getStack(hoverIndex)) {
            // we're hovering over an item
            this.tooltip.position = updateData.input.mousePos
            const stack = hoverInv.getStack(hoverIndex)
            const item = ITEM_METADATA_MAP[stack.item]
            const count = stack.count > 1 ? " x" + stack.count : ""

            const actions: { verb: string; actionFn: () => void }[] = []

            const decrementStack = () => {
                if (stack.count === 1) {
                    hoverInv.setStack(hoverIndex, null)
                } else {
                    stack.count--
                }
            }

            // Only allow actions when in the inventory menu
            if (!this.tradingInv) {
                const wl = LocationManager.instance.currentLocation
                if (
                    item.element !== null &&
                    wl.allowPlacing &&
                    Elements.instance.getElementFactory(item.element).canPlaceInLocation(wl)
                ) {
                    actions.push({
                        verb: "place",
                        actionFn: () => {
                            this.close()
                            PlaceElementDisplay.instance.startPlacing(
                                item.element,
                                decrementStack,
                                stack.count
                            )
                        },
                    })
                }
                if (
                    !!item.equippableWeapon &&
                    Player.instance.dude.weaponType !== item.equippableWeapon
                ) {
                    actions.push({
                        verb: "equip",
                        actionFn: () => {
                            Player.instance.dude.setWeapon(item.equippableWeapon)
                            refreshView()
                        },
                    })
                }
                if (
                    !!item.equippableShield &&
                    Player.instance.dude.shieldType !== item.equippableShield
                ) {
                    actions.push({
                        verb: "equip off-hand",
                        actionFn: () => {
                            Player.instance.dude.setShield(item.equippableShield)
                            refreshView()
                        },
                    })
                }
                if (!!item.consumable) {
                    actions.push({
                        verb: "eat",
                        actionFn: () => {
                            item.consumable()
                            decrementStack()
                            refreshView()
                        },
                    })
                }
            }

            // We currently only support up to 2 interaction types per item
            const interactButtonOrder = [Controls.interactButton, Controls.interactButtonSecondary]

            let tooltipString = `${item.displayName}${count}`

            actions.forEach((action, i) => {
                tooltipString += `\n[${InputKeyString.for(interactButtonOrder[i])} to ${
                    action.verb
                }]`
            })

            this.tooltip.say(tooltipString)

            if (this.canUseItems) {
                actions.forEach((action, i) => {
                    if (updateData.input.isKeyDown(interactButtonOrder[i])) {
                        action.actionFn()
                    }
                })
            }
        } else {
            this.tooltip.clear()
        }

        // Re-check isOpen because actions could have closed the menu
        if (this.isOpen) {
            this.canUseItems = true
            this.lastMousPos = updateData.input.mousePos

            if (updateData.input.isMouseDown) {
                const hoveredItemStack = hoverInv?.getStack(hoverIndex)
                if (!!hoveredItemStack) {
                    const { item, count } = hoveredItemStack
                    const otherInv = hoverInv === this.playerInv ? this.tradingInv : this.playerInv
                    if (
                        !!otherInv &&
                        updateData.input.isKeyHeld(Controls.pcModifierKey) &&
                        otherInv.canAddItem(item, count) &&
                        canRemoveFromPlayerInv(item)
                    ) {
                        hoverInv.removeItem(item, count)
                        otherInv.addItem(item, count)
                        refreshView()
                    } else {
                        this.trackedTileInventory = hoverInv
                        // some stupid math to account for the fact that this.tiles contains tiles from potentially two inventories
                        this.trackedTile =
                            this.tiles[
                                hoverIndex + (hoverInv === this.playerInv ? 0 : this.playerInv.size)
                            ]
                        this.trackedTileIndex = hoverIndex
                    }
                }
            }
        }
    }

    private getOffsetForInv(inv: Inventory) {
        if (inv === this.tradingInv) {
            return this.tradingInvOffset
        } else {
            return this.offset
        }
    }

    private spawnBG(inv: Inventory) {
        const offset = this.getOffsetForInv(inv)
        const bgTiles = NineSlice.makeNineSliceComponents(
            Tilesets.instance.oneBit.getNineSlice("invBoxNW"),
            offset.minus(new Point(TILE_SIZE / 2, TILE_SIZE / 2)),
            new Point(1 + InventoryDisplay.COLUMNS, 1 + inv.size / InventoryDisplay.COLUMNS)
        )

        bgTiles.forEach((tile) => this.displayEntity.addComponent(tile))
        bgTiles[0].transform.depth = UIStateManager.UI_SPRITE_DEPTH
    }

    getEntities(): Entity[] {
        return [this.e, this.displayEntity]
    }

    close() {
        if (!!this.trackedTile) {
            return
        }
        this.showingInv = false
        this.tiles = []
        this.tooltip.clear()
        this.displayEntity = null
        this.tradingInv = null
        this.canUseItems = false

        if (this.onClose) {
            this.onClose()
            this.onClose = null
        }
    }

    open(onClose: () => void = null, tradingInv: Inventory = null) {
        this.onClose = onClose
        this.tradingInv = tradingInv
        const screenDimensions = Camera.instance.dimensions
        this.showingInv = true

        this.tiles = []

        const displayDimensions = new Point(
            InventoryDisplay.COLUMNS,
            this.playerInv.size / InventoryDisplay.COLUMNS
        ).times(TILE_SIZE)

        this.offset = new Point(
            Math.floor(screenDimensions.x / 2 - displayDimensions.x / 2),
            Math.floor(screenDimensions.y / 5)
        )

        this.tradingInvOffset = this.offset.plusY(TILE_SIZE * 3.5)

        this.displayEntity = new Entity([
            // coins
            new AnimatedSpriteComponent(
                [Tilesets.instance.dungeonCharacters.getTileSetAnimation("coin_anim", 150)],
                new SpriteTransform(this.offset.plus(this.coinsOffset))
            ),
            new BasicRenderComponent(
                new TextRender(
                    `x${saveManager.getState().coins}`,
                    new Point(9, 1).plus(this.offset).plus(this.coinsOffset),
                    TEXT_SIZE,
                    TEXT_FONT,
                    Color.YELLOW,
                    UIStateManager.UI_SPRITE_DEPTH
                )
            ),
        ])

        this.renderInv(this.playerInv)

        if (!!this.tradingInv) {
            this.renderInv(this.tradingInv)
        }
    }

    private renderInv(inv: Inventory) {
        // background
        this.spawnBG(inv)

        // icons
        for (let i = 0; i < inv.size; i++) {
            const stack = inv.getStack(i)
            let tile = null
            if (!!stack) {
                const itemMeta = ITEM_METADATA_MAP[stack.item]
                if (!itemMeta) {
                    console.log(`missing item metadata for ${stack.item}`)
                }
                const c = itemMeta.inventoryIconSupplier().toComponent()
                c.transform.depth = UIStateManager.UI_SPRITE_DEPTH + 1
                tile = this.displayEntity.addComponent(c)
                tile.transform.position = this.getPositionForInventoryIndex(i, inv)
            }
            this.tiles.push(tile)
        }
    }

    private getPositionForInventoryIndex(i: number, inv: Inventory) {
        return new Point(i % InventoryDisplay.COLUMNS, Math.floor(i / InventoryDisplay.COLUMNS))
            .times(TILE_SIZE)
            .plus(this.getOffsetForInv(inv))
    }

    /**
     * @return a tuple of [inventory, index of that inventory which is hovered]
     *         the result is non-null but inventory can be null
     */
    private getHoveredInventoryIndex(pos: Point): [Inventory, number] {
        const getIndexForOffset = (inv: Inventory) => {
            const p = pos.minus(this.getOffsetForInv(inv))
            const x = Math.floor(p.x / TILE_SIZE)
            const y = Math.floor(p.y / TILE_SIZE)
            if (
                x < 0 ||
                x >= InventoryDisplay.COLUMNS ||
                y < 0 ||
                y >= Math.floor(inv.size / InventoryDisplay.COLUMNS)
            ) {
                return -1
            }
            return y * InventoryDisplay.COLUMNS + x
        }

        const index = getIndexForOffset(this.playerInv)
        if (index > -1) {
            return [this.playerInv, index]
        }

        if (!!this.tradingInv) {
            const tradingIndex = getIndexForOffset(this.tradingInv)
            if (tradingIndex > -1) {
                return [this.tradingInv, tradingIndex]
            }
        }

        return [null, -1]
    }
}
