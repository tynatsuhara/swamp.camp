import { Component, Entity, InputKey, InputKeyString, Point, pt, UpdateData } from "brigsby/dist"
import { BasicRenderComponent, TextRender } from "brigsby/dist/renderer"
import {
    AnimatedSpriteComponent,
    NineSlice,
    SpriteComponent,
    SpriteTransform,
} from "brigsby/dist/sprites"
import { Dude } from "../characters/Dude"
import { player } from "../characters/player"
import { controls } from "../Controls"
import { Camera } from "../cutscenes/Camera"
import { Tilesets, TILE_SIZE } from "../graphics/Tilesets"
import { getInventoryItemActions, ItemAction } from "../items/getInventoryItemActions"
import { Inventory, ItemStack } from "../items/Inventory"
import { ItemMetadata, ItemSpec, ITEM_METADATA_MAP } from "../items/Items"
import { clientSyncFn } from "../online/utils"
import { saveManager } from "../SaveManager"
import { Color } from "./Color"
import { TEXT_FONT, TEXT_SIZE } from "./Text"
import { Tooltip } from "./Tooltip"
import { UIStateManager } from "./UIStateManager"

/**
 * NEW UX PLAN
 * REPRESENT THE STACK YOU ARE “DRAWING FROM”, AND THE AMOUNT YOU ARE DRAWING, RATHER THAN THE FULL STACK
 *
 * [X] Can pick up half with right click
 * [X] Can swap FULL stacks
 * [X] Merge stacks
 * [X] Shift click stacks
 * [ ] Can drop portions of stacks 1 at at time
 * [ ] Make sure you handle the case where a different user updates the stack they're drawing from (probably just reset)
 * [X] Show the count via the tooltip
 * [ ] Some way to unselect your held stack (click outside? tab?)
 * [?] BUG: Sprite gets stuck when clicking in between valid squares
 * [ ] BUG: After putting an equipped item in the inventory, weapon hot key for item still in inv doesn't work
 *
 * [ ] Add "equipped" field to item metadata and prevent (or properly unequip) those items
 *
 */

export class InventoryDisplay extends Component {
    static instance: InventoryDisplay

    private static COLUMNS = 10

    private heldStackCount: number // should be <= the value of the stack in the inventory
    private heldStackInventory: Inventory
    private heldStackInvIndex: number
    private heldStackSprite: SpriteComponent // non-null when being dragged

    private readonly e: Entity = new Entity() // entity for this component
    private displayEntity: Entity
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

        this.tooltip.position = controls.getMousePos()

        const [hoverInv, hoverIndex] = this.getHoveredInventoryIndex(controls.getMousePos())

        const wasHoldingSomething = !!this.heldStackSprite

        if (wasHoldingSomething) {
            this.checkDragAndDrop(hoverInv, hoverIndex)
        } else if (hoverIndex > -1 && hoverInv.getStack(hoverIndex)) {
            this.checkMouseHoverActions(hoverInv, hoverIndex, updateData)
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

    private checkDragAndDrop(hoverInv: Inventory, hoverIndex: number) {
        // dragging
        this.tooltip.clear()
        if (controls.isInventoryStackDrop()) {
            let actionSuccess = false

            if (hoverIndex !== -1) {
                const draggedValue = this.heldStackInventory.getStack(this.heldStackInvIndex)

                // transfer partial stacks
                if (
                    this.canTransfer(
                        this.heldStackInventory,
                        this.heldStackInvIndex,
                        hoverInv,
                        hoverIndex,
                        this.heldStackCount
                    )
                ) {
                    actionSuccess = true
                    this.transfer(
                        this.heldStackInventory.uuid,
                        this.heldStackInvIndex,
                        hoverInv.uuid,
                        hoverIndex,
                        this.heldStackCount
                    )
                } else if (this.heldStackCount === draggedValue.count) {
                    // swap full stacks
                    if (hoverInv === this.playerInv) {
                        actionSuccess = true
                        this.swapStacks(
                            this.heldStackInventory.uuid,
                            this.heldStackInvIndex,
                            hoverInv.uuid,
                            hoverIndex
                        )
                    }
                }
            }

            this.heldStackCount = undefined
            this.heldStackInvIndex = undefined
            this.heldStackInventory = null
            this.heldStackSprite?.delete()
            this.heldStackSprite = null

            if (!actionSuccess) {
                // only refresh if we didn't successfully swap, otherwise there's a weird
                // jitter in multiplayer as the inventory is only updated on the host
                this.refreshView()
            }
        } else {
            if (this.heldStackCount > 1) {
                this.tooltip.say(`x${this.heldStackCount}`)
            }
            // track
            this.heldStackSprite.transform.position = this.heldStackSprite.transform.position.plus(
                controls.getMousePos().minus(this.lastMousPos)
            )
        }
    }

    private isInventoryUpdateValid(dudeInv: Inventory, invA: Inventory, invB: Inventory) {
        // do a bunch of validation to prevent h4xx0rs

        if (!invA || !invB) {
            console.warn(`invalid inventory ID(s)`)
            return false
        }

        if (invA === invB) {
            // moving stuff around in the same inventory
            if (invA !== dudeInv && !invA.allowTrading) {
                console.warn(`invalid inventory ID(s)`)
                return false
            }
            // if (stackIdxA === stackIdxB) {
            //     return
            // }
        } else {
            // at least one inv must be the player
            const selfInv = [invA, invB].filter((i) => i === dudeInv)
            if (selfInv.length < 1) {
                console.warn(`invalid inventory ID(s)`)
                return false
            }

            // the other inv must be tradeable
            if (selfInv.length < 2) {
                const doesOtherInvAllowTrading = [invA, invB].find(
                    (i) => i !== dudeInv
                )?.allowTrading
                if (!doesOtherInvAllowTrading) {
                    console.warn(`inventory does not allow trading`)
                    return false
                }
            }
        }

        return true
    }

    private removePlayerInvOnlyMetadata(metadata: ItemMetadata) {
        metadata.hotKey = undefined
        metadata.equipped = undefined
    }

    private canTransfer(
        invA: Inventory,
        stackIdxA: number,
        invB: Inventory,
        stackIdxB: number,
        transferAmount: number
    ) {
        const stackA = invA.getStack(stackIdxA)
        const isSameStack = invA === invB && stackIdxA === stackIdxB
        return (
            !isSameStack &&
            stackA &&
            stackA.count >= transferAmount &&
            invB.canAddToStack(stackIdxB, stackA.item, transferAmount, stackA.metadata)
        )
    }

    private transfer = clientSyncFn(
        "invtrans",
        "host-only",
        (
            { dudeUUID },
            invIdA: string,
            stackIdxA: number,
            invIdB: string,
            stackIdxB: number,
            transferAmount: number
        ) => {
            const dudeInv = Dude.get(dudeUUID).inventory
            const invA = Inventory.get(invIdA)
            const invB = Inventory.get(invIdB)

            if (!this.isInventoryUpdateValid(dudeInv, invA, invB)) {
                return
            }

            const stackA = invA.getStack(stackIdxA)
            if (!this.canTransfer(invA, stackIdxA, invB, stackIdxB, transferAmount)) {
                console.warn("invalid inventory transfer")
                return
            }

            // remove first
            invA.removeItemAtIndex(stackIdxA, transferAmount)

            // add to the other stack
            const newMetadata = { ...stackA.metadata }
            if (invB !== dudeInv) {
                this.removePlayerInvOnlyMetadata(newMetadata)
            }
            invB.addToStack(stackIdxB, stackA.item, transferAmount, newMetadata)
        }
    )

    /**
     * invA refers to the src inventory, invB is the dst inventory
     * stackIdxB can be -1 if we're just moving it wherever it fits (eg shift-clicking)
     */
    private swapStacks = clientSyncFn(
        "swapstax",
        "host-only",
        ({ dudeUUID }, invIdA: string, stackIdxA: number, invIdB: string, stackIdxB: number) => {
            const dudeInv = Dude.get(dudeUUID).inventory
            const invA = Inventory.get(invIdA)
            const invB = Inventory.get(invIdB)

            if (!this.isInventoryUpdateValid(dudeInv, invA, invB)) {
                return
            }

            const setInvStack = (inv: Inventory, stackIdx: number, stack: ItemStack) => {
                const newMetadata = { ...stackA.metadata }
                if (invB !== dudeInv) {
                    this.removePlayerInvOnlyMetadata(newMetadata)
                }

                const updatedStack = stack?.withMetadata(newMetadata)

                if (stackIdx !== -1) {
                    // put it in the slot specified
                    inv.setStack(stackIdx, updatedStack)
                } else if (stack) {
                    // stackIdx === -1 means to just add it wherever
                    inv.addItem(stack.item, stack.count, stack.metadata)
                }
            }

            const stackA = invA.getStack(stackIdxA)
            const stackB = invB.getStack(stackIdxB)

            if (stackIdxB !== -1) {
                // swap
                // trigger removal hooks if necessary
                invA.removeItemAtIndex(stackIdxA, stackA.count)
                invB.removeItemAtIndex(stackIdxB, stackB.count)
                // add stacks back
                setInvStack(invA, stackIdxA, stackB)
                setInvStack(invB, stackIdxB, stackA)
            } else {
                // add wherever
                // trigger removal hooks if necessary
                invA.removeItemAtIndex(stackIdxA, stackA.count)
                setInvStack(invB, -1, stackA)
            }
        }
    )

    private checkMouseHoverActions(
        hoverInv: Inventory,
        hoverIndex: number,
        updateData: UpdateData
    ) {
        // we're hovering over an item
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

        const tooltipString = [
            hotKeyPrefix,
            item.displayName,
            count,
            ...actions.map((action, i) => `\n${interactButtonOrder[i][0]} to ${action.verb}`),
        ].join("")

        this.tooltip.say(tooltipString)

        if (this.canUseItems) {
            actions.forEach((action, i) => {
                if (interactButtonOrder[i][1]()) {
                    action.actionFn()
                }
            })
        }
    }

    private checkForPickUp(hoverInv: Inventory, hoverIndex: number) {
        if (controls.isInventoryStackPickUp() || controls.isInventoryStackPickUpHalf()) {
            const hoveredItemStack = hoverInv?.getStack(hoverIndex)
            if (hoveredItemStack) {
                const { item, count, metadata } = hoveredItemStack
                const otherInv = hoverInv === this.playerInv ? this.tradingInv : this.playerInv
                if (
                    otherInv &&
                    controls.isModifierHeld() &&
                    otherInv.canAddItem(item, count, metadata)
                ) {
                    // shift click transfer
                    hoverInv.removeItemAtIndex(hoverIndex, count)
                    otherInv.addItem(item, count, metadata)
                } else {
                    this.heldStackInventory = hoverInv
                    this.heldStackInvIndex = hoverIndex
                    this.heldStackCount = controls.isInventoryStackPickUpHalf()
                        ? Math.ceil(count / 2)
                        : count

                    // some stupid math to account for the fact that this.tiles contains tiles from potentially two inventories
                    const hoveredSprite =
                        this.stackSprites[
                            hoverIndex + (hoverInv === this.playerInv ? 0 : this.playerInv.size)
                        ]
                    this.heldStackSprite = this.displayEntity.addComponent(
                        new SpriteComponent(hoveredSprite.sprite)
                    )
                    this.heldStackSprite.transform.position = controls
                        .getMousePos()
                        .minus(pt(TILE_SIZE / 2))
                    this.heldStackSprite.transform.depth = hoveredSprite.transform.depth
                    if (this.heldStackCount === count) {
                        hoveredSprite.enabled = false
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
