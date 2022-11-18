import { Component, Entity, InputKey, InputKeyString, Point, UpdateData } from "brigsby/dist"
import { BasicRenderComponent, TextRender } from "brigsby/dist/renderer"
import {
    AnimatedSpriteComponent,
    NineSlice,
    SpriteComponent,
    SpriteTransform,
} from "brigsby/dist/sprites"
import { Dude } from "../characters/Dude"
import { player } from "../characters/player"
import { ShieldType } from "../characters/weapons/ShieldType"
import { WeaponType } from "../characters/weapons/WeaponType"
import { controls } from "../Controls"
import { Camera } from "../cutscenes/Camera"
import { Tilesets, TILE_SIZE } from "../graphics/Tilesets"
import { getInventoryItemActions, ItemAction } from "../items/getInventoryItemActions"
import { Inventory, ItemStack } from "../items/Inventory"
import { Item, ItemSpec, ITEM_METADATA_MAP } from "../items/Items"
import { clientSyncFn } from "../online/utils"
import { saveManager } from "../SaveManager"
import { Color } from "./Color"
import { TEXT_FONT, TEXT_SIZE } from "./Text"
import { Tooltip } from "./Tooltip"
import { UIStateManager } from "./UIStateManager"

export class InventoryDisplay extends Component {
    static instance: InventoryDisplay

    private static COLUMNS = 10

    private readonly e: Entity = new Entity() // entity for this component
    private displayEntity: Entity
    private heldStackInventory: Inventory
    private heldStackInvIndex: number
    private heldStackSprite: SpriteComponent // non-null when being dragged
    private lastMousPos: Point
    private stackSprites: SpriteComponent[] = []
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
    private get playerInv() {
        return player().inventory
    }

    constructor() {
        super()
        this.e.addComponent(this)
        this.tooltip = this.e.addComponent(new Tooltip())
        InventoryDisplay.instance = this
    }

    lateUpdate(updateData: UpdateData) {
        const pressI = controls.isInventoryButtonDown()
        const pressEsc = controls.isCloseMenuButtonDown()

        if (this.isOpen && (pressI || pressEsc)) {
            this.close()
        } else if (pressI && !UIStateManager.instance.isMenuOpen) {
            this.open()
        }

        if (!this.isOpen) {
            return
        }

        const [hoverInv, hoverIndex] = this.getHoveredInventoryIndex(controls.getMousePos())

        const wasHoldingSomething = !!this.heldStackSprite

        if (wasHoldingSomething) {
            this.doDrag(hoverInv, hoverIndex)
        } else if (hoverIndex > -1 && hoverInv.getStack(hoverIndex)) {
            this.doHover(hoverInv, hoverIndex, updateData)
        } else {
            this.tooltip.clear()
        }

        // Re-check isOpen because actions could have closed the menu
        if (this.isOpen) {
            this.canUseItems = true
            this.lastMousPos = controls.getMousePos()

            if (!wasHoldingSomething) {
                this.checkForPickUp(hoverInv, hoverIndex)
            }
        }
    }

    private checkSetHotKey(index: number, spec: ItemSpec, updateData: UpdateData) {
        if (!spec.equippableWeapon && !spec.equippableShield) {
            return
        }

        controls.HOT_KEY_OPTIONS.forEach((hotKey) => {
            if (updateData.input.isKeyDown(hotKey)) {
                this.setHotKey(index, hotKey)
            }
        })
    }

    private setHotKey = clientSyncFn(
        "sethotkey",
        "host-only",
        ({ dudeUUID }, index: number, hotKey: InputKey) => {
            const inv = Dude.get(dudeUUID).inventory

            inv.getStacks().forEach((s, i) => {
                if (s.metadata?.hotKey === hotKey) {
                    inv.setStack(i, s.withMetadata({ ...s.metadata, hotKey: undefined }))
                }
            })

            const stack = inv.getStack(index)
            inv.setStack(index, stack.withMetadata({ ...stack.metadata, hotKey }))
        }
    )

    isShowingInventory(inv: Inventory) {
        return this.isOpen && (this.playerInv === inv || this.tradingInv === inv)
    }

    refreshView() {
        this.open(this.onClose, this.tradingInv)
    }

    private canRemoveFromPlayerInv(item: Item) {
        if (this.playerInv.getItemCount(item) === 1) {
            // unequip equipped weapons
            const weapon: WeaponType = WeaponType[WeaponType[item]]
            if (!!weapon && player().weaponType === weapon) {
                return false
            }

            // unequip equipped shields
            const shield: ShieldType = ShieldType[ShieldType[item]]
            if (!!shield && player().shieldType === shield) {
                return false
            }
        }
        return true
    }

    private doDrag(hoverInv: Inventory, hoverIndex: number) {
        // dragging
        this.tooltip.clear()
        if (controls.isInventoryStackDrop()) {
            let swapSuccess = false
            // drop n swap
            if (hoverIndex !== -1) {
                // Swap the stacks
                const draggedValue = this.heldStackInventory.getStack(this.heldStackInvIndex)

                // Swap the stacks
                if (hoverInv === this.playerInv || this.canRemoveFromPlayerInv(draggedValue.item)) {
                    swapSuccess = true
                    this.swapStacks(
                        hoverInv.uuid,
                        hoverIndex,
                        this.heldStackInventory.uuid,
                        this.heldStackInvIndex
                    )
                }
            }

            this.heldStackInventory = null
            this.heldStackSprite = null

            // this.stripHotKeysFromOtherInv()

            if (!swapSuccess) {
                // only refresh if we didn't successfully swap, otherwise there's a weird
                // jitter in multiplayer as the inventory is only updated on the host
                this.refreshView()
            }
        } else {
            // track
            this.heldStackSprite.transform.position = this.heldStackSprite.transform.position.plus(
                controls.getMousePos().minus(this.lastMousPos)
            )
        }
    }

    /**
     * invA refers to the src inventory, invB is the dst inventory
     * stackIdxB can be -1 if we're just moving it wherever it fits (eg shift-clicking)
     */
    private swapStacks = clientSyncFn(
        "swapstax",
        "host-only",
        ({ dudeUUID }, invIdA: string, stackIdxA: number, invIdB: string, stackIdxB: number) => {
            // do a bunch of validation to prevent h4xx0rs
            const invA = Inventory.get(invIdA)
            const invB = Inventory.get(invIdB)
            if (!invA || !invB) {
                console.warn(`invalid inventory ID(s)`)
                return
            }

            const dudeInv = Dude.get(dudeUUID).inventory

            if (invA === invB) {
                // moving stuff around in the same inventory
                if (invA !== dudeInv && !invA.allowTrading) {
                    console.warn(`invalid inventory ID(s)`)
                    return
                }
                if (stackIdxA === stackIdxB) {
                    return
                }
            } else {
                // at least one inv must be the player
                const selfInv = [invA, invB].filter((i) => i === dudeInv)
                if (selfInv.length < 1) {
                    console.warn(`invalid inventory ID(s)`)
                    return
                }

                // the other inv must be tradeable
                if (selfInv.length < 2) {
                    const doesOtherInvAllowTrading = [invA, invB].find(
                        (i) => i !== dudeInv
                    )?.allowTrading
                    if (!doesOtherInvAllowTrading) {
                        console.warn(`inventory does not allow trading`)
                        return
                    }
                }
            }

            const updateInvStack = (inv: Inventory, stackIdx: number, stack: ItemStack) => {
                // strip hotkey from metadata
                const updatedStack = stack?.withMetadata({
                    ...stack.metadata,
                    hotKey: inv === dudeInv ? stack.metadata.hotKey : undefined,
                })

                if (stackIdx !== -1) {
                    // put it in the slot specified
                    inv.setStack(stackIdx, updatedStack)
                } else if (stack) {
                    // stackIdx === -1 means to just add it wherever
                    inv.addItem(stack.item, stack.count, stack.metadata)
                }
            }

            if (stackIdxB !== -1) {
                // swap
                const stackA = invA.getStack(stackIdxA)
                const stackB = invB.getStack(stackIdxB)
                updateInvStack(invA, stackIdxA, stackB)
                updateInvStack(invB, stackIdxB, stackA)
            } else {
                // add
                updateInvStack(invB, stackIdxB, invA.getStack(stackIdxA))
                invA.setStack(stackIdxA, null)
            }
        }
    )

    private doHover(hoverInv: Inventory, hoverIndex: number, updateData: UpdateData) {
        // we're hovering over an item
        this.tooltip.position = controls.getMousePos()
        const stack = hoverInv.getStack(hoverIndex)
        const item = ITEM_METADATA_MAP[stack.item]
        const hotKeyPrefix = stack.metadata.hotKey
            ? `(${InputKeyString.for(stack.metadata.hotKey)}) `
            : ""
        const count = stack.count > 1 ? " x" + stack.count : ""

        // Only allow actions when in the inventory menu
        const actions: ItemAction[] = this.tradingInv ? [] : getInventoryItemActions(hoverIndex)

        this.checkSetHotKey(hoverIndex, item, updateData)

        // We currently only support up to 2 interaction types per item
        const interactButtonOrder: [string, () => boolean][] = [
            [controls.getInventoryOptionOneString(), () => controls.isInventoryOptionOneDown()],
            [controls.getInventoryOptionTwoString(), () => controls.isInventoryOptionTwoDown()],
        ]

        let tooltipString = `${hotKeyPrefix}${item.displayName}${count}`

        actions.forEach((action, i) => {
            tooltipString += `\n${interactButtonOrder[i][0]} to ${action.verb}`
        })

        this.tooltip.say(tooltipString)

        if (this.canUseItems) {
            actions.forEach((action, i) => {
                if (interactButtonOrder[i][1]()) {
                    action.actionFn()
                }
            })
        }
    }

    // MPTODO
    private checkForPickUp(hoverInv: Inventory, hoverIndex: number) {
        if (controls.isInventoryStackPickUp()) {
            const hoveredItemStack = hoverInv?.getStack(hoverIndex)
            if (hoveredItemStack) {
                const { item, count, metadata } = hoveredItemStack
                const otherInv = hoverInv === this.playerInv ? this.tradingInv : this.playerInv
                if (
                    otherInv &&
                    controls.isModifierHeld() &&
                    otherInv.canAddItem(item, count, metadata) &&
                    this.canRemoveFromPlayerInv(item)
                ) {
                    hoverInv.removeItem(item, count, metadata)
                    otherInv.addItem(item, count, metadata)
                    this.refreshView()
                } else {
                    this.heldStackInventory = hoverInv
                    // some stupid math to account for the fact that this.tiles contains tiles from potentially two inventories
                    this.heldStackSprite =
                        this.stackSprites[
                            hoverIndex + (hoverInv === this.playerInv ? 0 : this.playerInv.size)
                        ]
                    this.heldStackInvIndex = hoverIndex
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

        NineSlice.makeNineSliceComponents(
            Tilesets.instance.oneBit.getNineSlice("invBoxNW").map((s) => () => s),
            new Point(1 + InventoryDisplay.COLUMNS, 1 + inv.size / InventoryDisplay.COLUMNS),
            {
                position: offset.minus(new Point(TILE_SIZE / 2, TILE_SIZE / 2)),
                depth: UIStateManager.UI_SPRITE_DEPTH,
            }
        )
            .sprites.values()
            .forEach((tile) => this.displayEntity.addComponent(tile))
    }

    getEntities(): Entity[] {
        return [this.e, this.displayEntity]
    }

    close() {
        if (!!this.heldStackSprite) {
            return
        }
        this.showingInv = false
        this.stackSprites = []
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

        this.stackSprites = []

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
                    Color.RED_6,
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
            if (stack) {
                const itemMeta = ITEM_METADATA_MAP[stack.item]
                if (!itemMeta) {
                    console.log(`missing item metadata for ${stack.item}`)
                }
                const c = itemMeta.inventoryIconSupplier().toComponent()
                c.transform.depth = UIStateManager.UI_SPRITE_DEPTH + 1
                tile = this.displayEntity.addComponent(c)
                tile.transform.position = this.getPositionForInventoryIndex(i, inv)
            }
            this.stackSprites.push(tile)
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
