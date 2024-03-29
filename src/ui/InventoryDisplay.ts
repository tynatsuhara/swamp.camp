import {
    Component,
    Entity,
    InputKey,
    InputKeyString,
    Point,
    profiler,
    pt,
    UpdateData,
} from "brigsby/dist"
import { BasicRenderComponent } from "brigsby/dist/renderer"
import { NineSlice, SpriteComponent } from "brigsby/dist/sprites"
import { Dude } from "../characters/Dude"
import { player } from "../characters/player"
import { controls } from "../core/Controls"
import { Singletons } from "../core/Singletons"
import { Camera } from "../cutscenes/Camera"
import { prettyPrint } from "../debug/JSON"
import { TILE_SIZE, Tilesets } from "../graphics/Tilesets"
import {
    getInventoryItemActions,
    getInventoryItemDonationActions,
    ItemAction,
} from "../items/getInventoryItemActions"
import { Inventory, ItemStack } from "../items/Inventory"
import { Item } from "../items/Item"
import { ITEM_METADATA_MAP, ItemMetadata, ItemSpec } from "../items/Items"
import { clientSyncFn } from "../online/syncUtils"
import { ClickableUI } from "./ClickableUI"
import { Color } from "./Color"
import { getGoldCountComponents } from "./GoldCountComponents"
import { formatText } from "./Text"
import { Tooltip } from "./Tooltip"
import { UI_SPRITE_DEPTH } from "./UiConstants"
import { UIStateManager } from "./UIStateManager"

export type DonatingOptions = {
    canDonate: (stack: ItemStack) => boolean
    onDonate: () => void
    verb: string
}

export class InventoryDisplay extends Component {
    static get instance() {
        return Singletons.getOrCreate(InventoryDisplay)
    }

    private static COLUMNS = 10

    private heldStack: ItemStack // count should be <= the value of the stack in the inventory
    private heldStackInventory: Inventory
    private heldStackInvIndex: number
    private heldStackSprite: SpriteComponent // non-null when being dragged

    private readonly e: Entity = new Entity() // entity for this component
    private displayEntity: Entity // this will get destroyed when refreshed
    private stackSprites: SpriteComponent[] = []
    private showingInv = false
    private hoverTooltipString: string
    private hoveredInventry: Inventory
    private hoveredInvIndex: number

    get isOpen() {
        return this.showingInv
    }
    get isStackHeld() {
        return !!this.heldStack
    }
    get isTrading() {
        return !!this.tradingInv
    }
    get isHoveringItem() {
        return (
            !!this.hoveredInventry &&
            (this.hoveredInventry !== this.heldStackInventory ||
                this.hoveredInvIndex !== this.heldStackInvIndex)
        )
    }

    private offset: Point
    private tooltip: Tooltip
    private readonly coinsOffset = new Point(-1, -18)
    private onClose: () => void
    private tradingInv: Inventory
    private tradingInvOffset: Point
    private canUseItems = false
    private get playerInv() {
        return player().inventory
    }
    private donatingOptions: DonatingOptions
    private get isDonating() {
        return !!this.donatingOptions
    }
    private tradingInvTitle: string

    constructor() {
        super()
        this.e.addComponent(this)
        this.tooltip = this.e.addComponent(new Tooltip())
    }

    lateUpdate(updateData: UpdateData) {
        const pressI = controls.isInventoryButtonDown()
        const pressEsc = controls.isCloseMenuButtonDown()

        if (this.isOpen && pressEsc) {
            this.close()
        } else if (pressI && !UIStateManager.instance.isMenuOpen) {
            this.open()
        }

        if (!this.isOpen) {
            return
        }

        const [hoverInv, hoverIndex] = this.getHoveredInventoryIndex(controls.getCursorPos())

        const wasHoldingSomething = !!this.heldStackSprite

        if (wasHoldingSomething) {
            this.checkDragAndDrop(hoverInv, hoverIndex)
        }

        if (hoverIndex > -1 && hoverInv.getStack(hoverIndex)) {
            this.hoveredInventry = hoverInv
            this.hoveredInvIndex = hoverIndex
            this.checkMouseHoverActions(hoverInv, hoverIndex, updateData)
        } else {
            this.hoveredInventry = undefined
            this.hoveredInvIndex = -1
            this.hoverTooltipString = undefined
        }

        // Re-check isOpen because actions could have closed the menu
        if (this.isOpen) {
            this.canUseItems = true

            if (!wasHoldingSomething) {
                this.checkForPickUp(hoverInv, hoverIndex)
            }
        }

        this.updateTooltip()
    }

    private updateTooltip() {
        if (!this.isOpen) {
            this.tooltip.clear()
            return
        }

        let text: string = undefined
        if (this.heldStack) {
            if (this.heldStack.count > 1) {
                text = `x${this.heldStack.count}`
            }
        } else {
            text = this.hoverTooltipString
        }
        if (text) {
            this.tooltip.say(text)
        } else {
            this.tooltip.clear()
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
                if (s?.metadata?.hotKey === hotKey) {
                    inv.setStack(i, s.withMetadata({ hotKey: undefined }))
                }
            })

            const stack = inv.getStack(index)
            inv.setStack(index, stack.withMetadata({ hotKey }))
        }
    )

    isShowingInventory(inv: Inventory) {
        return this.isOpen && (this.playerInv === inv || this.tradingInv === inv)
    }

    refreshView() {
        // As long as what we're holding is a subset of the stack in the inventory, don't drop it!
        // This prevents wonky behavior when two players are digging around in the same chest
        const { heldStackInventory, heldStackInvIndex, heldStack } = this
        const invStackPostUpdate = heldStackInventory?.getStack(heldStackInvIndex)
        const rePickUpItem =
            // we're currently holding something
            this.heldStack?.count > 0 &&
            // and the superset stack is still in the inventory
            invStackPostUpdate &&
            // and they're the same item
            invStackPostUpdate.item === heldStack.item

        // Open without changing any of the fields
        this._open(this.onClose, this.tradingInv, this.donatingOptions, this.tradingInvTitle)

        if (rePickUpItem) {
            const newHeldStack = invStackPostUpdate.withCount(
                Math.min(invStackPostUpdate.count, heldStack.count)
            )
            this.setHeldStack(heldStackInventory, heldStackInvIndex, newHeldStack)
        }
    }

    private clearHeldStack() {
        this.heldStack = undefined
        this.heldStackInvIndex = undefined
        this.heldStackInventory = null
        this.heldStackSprite?.delete()
        this.heldStackSprite = null
    }

    private setHeldStack(inv: Inventory, index: number, stack: ItemStack) {
        this.heldStackInventory = inv
        this.heldStackInvIndex = index
        this.heldStack = stack

        // some stupid math to account for the fact that this.tiles contains tiles from potentially two inventories
        const stackSprite =
            this.stackSprites[index + (inv === this.playerInv ? 0 : this.playerInv.size)]
        // create a new sprite which is the "picked up" one
        // we put it on the entity rather than DisplayEntity to prevent a flash when refreshing
        // due to the new DisplayEntity not being rendered
        this.heldStackSprite = this.entity.addComponent(new SpriteComponent(stackSprite.sprite))
        // center it on the mouse
        this.heldStackSprite.transform.position = controls.getCursorPos().minus(pt(TILE_SIZE / 2))
        this.heldStackSprite.transform.depth = stackSprite.transform.depth
        // if we're holding all the items, hide the sprite in the slot
        stackSprite.enabled = this.heldStack.count < inv.getStack(index)?.count
    }

    private checkDragAndDrop(hoverInv: Inventory, hoverIndex: number) {
        // dragging
        const dropFullStack = controls.isInventoryStackPickUpOrDrop()
        const dropOne = controls.isInventoryStackPickUpHalfOrDropOne()

        if (dropFullStack || dropOne) {
            let actionSuccess = false

            if (hoverIndex !== -1) {
                const stackInInventory = this.heldStackInventory.getStack(this.heldStackInvIndex)
                const amountToTransfer = dropOne ? 1 : this.heldStack.count
                const newHeldCount = this.heldStack.count - amountToTransfer

                // transfer partial stacks
                if (
                    this.canTransfer(
                        this.heldStackInventory,
                        this.heldStackInvIndex,
                        hoverInv,
                        hoverIndex,
                        amountToTransfer
                    )
                ) {
                    const isSameStack =
                        this.heldStackInventory === hoverInv &&
                        this.heldStackInvIndex === hoverIndex
                    if (isSameStack) {
                        if (dropFullStack) {
                            // no-op
                            this.clearHeldStack()
                        } else if (dropOne) {
                            this.heldStack = this.heldStack.withCount(this.heldStack.count - 1)
                        }
                    } else {
                        actionSuccess = true
                        this.heldStack = this.heldStack.withCount(newHeldCount)

                        this.transfer(
                            this.heldStackInventory.uuid,
                            this.heldStackInvIndex,
                            hoverInv.uuid,
                            hoverIndex,
                            amountToTransfer
                        )
                    }
                } else if (this.heldStack.count === stackInInventory.count) {
                    // swap full stacks
                    actionSuccess = true
                    this.heldStack = this.heldStack.withCount(newHeldCount)

                    this.swapStacks(
                        this.heldStackInventory.uuid,
                        this.heldStackInvIndex,
                        hoverInv.uuid,
                        hoverIndex
                    )
                }
            } else {
                // clicking outside inv will put the stack back
                this.clearHeldStack()
            }

            if (!actionSuccess) {
                // only refresh if we didn't successfully swap, because inv
                // updates from the host will trigger a refresh anyways
                this.refreshView()
            }
        } else {
            this.heldStackSprite.transform.position = controls
                .getCursorPos()
                .minus(pt(TILE_SIZE / 2))
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
        return (
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
        (
            { dudeUUID },
            invIdA: string,
            stackIdxA: number,
            invIdB: string,
            stackIdxB: number = -1
        ) => {
            const dudeInv = Dude.get(dudeUUID).inventory
            const invA = Inventory.get(invIdA)
            const invB = Inventory.get(invIdB)

            if (!this.isInventoryUpdateValid(dudeInv, invA, invB)) {
                return
            }

            const setInvStack = (inv: Inventory, stackIdx: number, stack: ItemStack) => {
                const newMetadata = { ...stack.metadata }
                if (invB !== dudeInv) {
                    this.removePlayerInvOnlyMetadata(newMetadata)
                }

                if (stackIdx !== -1) {
                    // put it in the slot specified
                    inv.setStack(stackIdx, stack?.withMetadata(newMetadata))
                } else if (stack) {
                    // stackIdx === -1 means to just add it wherever
                    inv.addItem(stack.item, stack.count, newMetadata)
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
            ? `<${InputKeyString.for(stack.metadata.hotKey)}> `
            : ""

        let actions: ItemAction[] = []
        if (this.isDonating) {
            actions = getInventoryItemDonationActions(hoverIndex, this.donatingOptions)
        } else if (hoverInv !== this.tradingInv) {
            // Don't allow interactions with things in chests
            actions = getInventoryItemActions(hoverIndex)
        }

        this.checkSetHotKey(hoverIndex, item, updateData)

        // We currently only support up to 2 interaction types per item
        const interactButtonOrder: [string, () => boolean][] = [
            [controls.getInventoryOptionOneString(), () => controls.isInventoryOptionOneDown()],
            [controls.getInventoryOptionTwoString(), () => controls.isInventoryOptionTwoDown()],
        ]
        if (actions.length > interactButtonOrder.length) {
            throw new Error(`too many actions for item ${Item[stack.item]}`)
        }

        this.hoverTooltipString = [
            hotKeyPrefix,
            stack.stackString(),
            ...actions.map((action, i) => `\n${interactButtonOrder[i][0]} to ${action.verb}`),
        ].join("")

        profiler.showInfo(`item metadata: ${prettyPrint(stack.metadata)}`)

        if (this.canUseItems) {
            actions.forEach((action, i) => {
                if (interactButtonOrder[i][1]()) {
                    action.actionFn()
                }
            })
        }
    }

    private checkForPickUp(hoverInv: Inventory, hoverIndex: number) {
        const isPickUp = controls.isInventoryStackPickUpOrDrop()
        const isPickUpHalf = controls.isInventoryStackPickUpHalfOrDropOne()
        const isSwap = controls.isInventorySwap()

        if (isPickUp || isPickUpHalf || isSwap) {
            const hoveredItemStack = hoverInv?.getStack(hoverIndex)
            if (hoveredItemStack) {
                const { item, count, metadata } = hoveredItemStack
                const otherInv = hoverInv === this.playerInv ? this.tradingInv : this.playerInv
                if (isSwap && otherInv && otherInv.canAddItem(item, count, metadata)) {
                    // shift-click transfer
                    this.clearHeldStack()
                    this.swapStacks(hoverInv.uuid, hoverIndex, otherInv.uuid)
                } else if (!isSwap) {
                    const amountPickedUp = isPickUpHalf ? Math.ceil(count / 2) : count
                    this.setHeldStack(
                        hoverInv,
                        hoverIndex,
                        hoverInv.getStack(hoverIndex).withCount(amountPickedUp)
                    )
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
                depth: UI_SPRITE_DEPTH,
            }
        )
            .sprites.values()
            .forEach((tile) => this.displayEntity.addComponent(tile))
    }

    getEntities(): Entity[] {
        return [this.e, this.displayEntity]
    }

    close() {
        this.clearHeldStack()
        this.tooltip.clear()
        this.showingInv = false
        this.stackSprites = []
        this.displayEntity = null
        this.tradingInv = null
        this.canUseItems = false

        if (this.onClose) {
            this.onClose()
            this.onClose = null
        }
    }

    open({
        onClose = null,
        tradingInv = null,
        donating = null,
        tradingInvTitle = null,
    }: {
        onClose?: () => void
        tradingInv?: Inventory
        donating?: DonatingOptions
        tradingInvTitle?: string
    } = {}) {
        // RAF to prevent accepting input in lateUpdate on the same frame that input opened the inventory
        requestAnimationFrame(() => this._open(onClose, tradingInv, donating, tradingInvTitle))
    }

    private _open(
        onClose: () => void | null,
        tradingInv: Inventory | null,
        donatingOptions: DonatingOptions | null,
        tradingInvTitle: string | null
    ) {
        this.clearHeldStack()

        this.onClose = onClose
        this.tradingInv = tradingInv
        this.donatingOptions = donatingOptions
        this.tradingInvTitle = tradingInvTitle

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

        const dropShadow = Color.RED_1

        this.displayEntity = new Entity(getGoldCountComponents(this.offset.plus(this.coinsOffset)))

        this.renderInv(this.playerInv)

        if (this.tradingInv) {
            this.tradingInvOffset = this.offset.plusY(TILE_SIZE * 4)
            this.displayEntity.addComponent(
                new BasicRenderComponent(
                    ...formatText({
                        text: this.tradingInvTitle ?? "Chest",
                        position: this.tradingInvOffset.plusY(-17),
                        color: Color.WHITE,
                        depth: UI_SPRITE_DEPTH,
                        dropShadow,
                    })
                )
            )
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
                const color =
                    !this.isDonating || this.donatingOptions.canDonate(stack)
                        ? Color.WHITE
                        : Color.RED_1
                const c = itemMeta.inventoryIconSupplier(color).toComponent()
                c.transform.depth = UI_SPRITE_DEPTH + 1
                tile = this.displayEntity.addComponent(c)
                tile.transform.position = this.getPositionForInventoryIndex(i, inv)
            }
            this.stackSprites.push(tile)
        }

        // Clickable UIs
        for (let i = 0; i < inv.size; i++) {
            this.displayEntity.addComponent(
                new ClickableUI(
                    `inv-${inv.uuid}-${i}`,
                    this.getPositionForInventoryIndex(i, inv).plus(pt(10)),
                    i === 0 && inv !== this.tradingInv,
                    true
                )
            )
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
