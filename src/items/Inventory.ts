import { InputKey } from "brigsby/dist"
import { stringifySorted } from "../debug/JSON"
import { syncFn } from "../online/utils"
import { InventoryDisplay } from "../ui/InventoryDisplay"
import { Item, ItemMetadata, ITEM_METADATA_MAP } from "./Items"

export type ItemStackMetadata = ItemMetadata & {
    hotKey?: InputKey
    equipped?: "weapon" | "shield" | undefined
}

export class ItemStack {
    readonly item: Item
    readonly count: number
    readonly metadata: Readonly<ItemStackMetadata>

    constructor(item: Item, count: number, metadata: ItemStackMetadata = {}) {
        this.item = item
        this.count = count
        this.metadata = metadata
    }

    withCount(newCount: number) {
        return new ItemStack(this.item, newCount, this.metadata)
    }

    withMetadata(metadata: Partial<ItemStackMetadata>) {
        return new ItemStack(this.item, this.count, { ...this.metadata, ...metadata })
    }

    equals(other: ItemStack): boolean {
        if (!other) {
            return false
        }
        return (
            other.item === this.item &&
            other.count === this.count &&
            doesMetadataMatch(other.metadata, this.metadata)
        )
    }
}

const doesMetadataMatch = (a: ItemStackMetadata, b: ItemStackMetadata) => {
    if (!a && !b) {
        return true
    } else if (a && b) {
        return stringifySorted(a) === stringifySorted(b)
    }
    return false
}

export class Inventory {
    readonly uuid: string
    readonly allowTrading: boolean
    private stacks: ItemStack[]
    private countMap = new Map<Item, number>()

    /**
     * @param syncId a unique identifier used for sync functions, max len 10 characters
     * @param allowTrading true if players can take stuff out of this storage via UI (used to prevent multiplayer stealing hax)
     */
    constructor(syncId: string, allowTrading = false, size: number = 20) {
        this.uuid = syncId
        this.stacks = Array.from({ length: size })
        this.allowTrading = allowTrading
        this.setStack = syncFn(`${syncId}ss`, this.setStack.bind(this))
        invCache[syncId] = this
    }

    static get(id: string) {
        return invCache[id]
    }

    get size() {
        return this.stacks.length
    }

    /**
     * @returns -1 if nothing matches the predicate
     */
    findIndex(predicate: (value: ItemStack | null, index: number) => boolean) {
        return this.stacks.findIndex(predicate)
    }

    getStack(index: number): ItemStack {
        return this.stacks[index]
    }

    getStacks() {
        return this.stacks.filter((s) => !!s)
    }

    setStack(index: number, stack: ItemStack) {
        // reconstruct to prevent serialization bugs (this is kind of a hack)
        this.stacks[index] = !stack?.count
            ? null
            : new ItemStack(stack.item, stack.count, stack.metadata)
        this.refreshUI()
        this.recomputeCountsMap()
    }

    /**
     * returns true if the item was successfully added
     */
    addItem(item: Item, count = 1, metadata: ItemStackMetadata = {}) {
        if (!this.canAddItem(item, count, metadata)) {
            return false
        }
        return this.addItemInternal(item, count, metadata, true)
    }

    canAddItem(item: Item, count: number = 1, metadata: ItemStackMetadata = {}): boolean {
        return this.addItemInternal(item, count, metadata, false)
    }

    /**
     * returns true if the item can be (or was) added
     * @param commit true to actually update the stack
     */
    private addItemInternal(item: Item, count = 1, metadata: ItemStackMetadata, commit: boolean) {
        const stackLimit = ITEM_METADATA_MAP[item].stackLimit

        let leftToAdd = count

        // First, add to existing stacks to preserve space.
        for (let i = 0; i < this.stacks.length && leftToAdd > 0; i++) {
            const slotValue = this.getStack(i)
            if (slotValue?.item === item && doesMetadataMatch(slotValue.metadata, metadata)) {
                const addedHere = Math.min(stackLimit - slotValue.count, leftToAdd)
                if (commit) {
                    this.setStack(i, slotValue.withCount(slotValue.count + addedHere))
                }
                leftToAdd -= addedHere
            }
        }

        // Then add to empty slots
        for (let i = 0; i < this.stacks.length && leftToAdd > 0; i++) {
            const slotValue = this.getStack(i)
            if (!slotValue) {
                const addedHere = Math.min(stackLimit, leftToAdd)
                leftToAdd -= addedHere
                if (commit) {
                    this.setStack(i, new ItemStack(item, addedHere, metadata))
                }
            }
        }

        return leftToAdd === 0
    }

    canAddToStack(index: number, item: Item, count = 1, metadata: ItemStackMetadata = {}) {
        const slotValue = this.getStack(index)
        const stackLimit = ITEM_METADATA_MAP[item].stackLimit

        if (!slotValue) {
            return true
        }

        return (
            slotValue.item === item &&
            doesMetadataMatch(slotValue.metadata, metadata) &&
            slotValue.count + count <= stackLimit
        )
    }

    addToStack(index: number, item: Item, count = 1, metadata: ItemStackMetadata = {}) {
        if (!this.canAddToStack(index, item, count, metadata)) {
            console.warn("can't add to stack")
            return
        }

        const slotValue = this.getStack(index)
        if (slotValue) {
            this.setStack(index, slotValue.withCount(slotValue.count + count))
        } else {
            this.setStack(index, new ItemStack(item, count, metadata))
        }
    }

    removeItemAtIndex(index: number, amountToRemove: number = 1) {
        const slotValue = this.getStack(index)
        if (!slotValue) {
            return
        }
        this.setStack(index, slotValue.withCount(slotValue.count - amountToRemove))
    }

    removeItem(item: Item, amountToRemove: number = 1, metadata: ItemStackMetadata = {}) {
        const currentCount = this.getItemCount(item)
        if (currentCount < amountToRemove) {
            console.error("inventory cannot go negative")
            return
        }
        this.countMap.set(item, currentCount - amountToRemove)

        for (let i = 0; i < this.stacks.length; i++) {
            const slotValue = this.getStack(i)
            if (slotValue?.item === item && doesMetadataMatch(slotValue.metadata, metadata)) {
                const amountRemovedFromSlot = Math.min(slotValue.count, amountToRemove)
                this.removeItemAtIndex(i, amountRemovedFromSlot)
                amountToRemove -= amountRemovedFromSlot
                if (amountToRemove === 0) {
                    return
                }
            }
        }
    }

    /**
     * Returns the total amount of an item in the inventory
     */
    getItemCount(item: Item): number {
        return this.countMap.get(item) ?? 0
    }

    save() {
        return this.stacks
    }

    private refreshUI() {
        if (InventoryDisplay.instance.isShowingInventory(this)) {
            InventoryDisplay.instance.refreshView()
        }
    }

    private recomputeCountsMap() {
        this.countMap = new Map()
        this.stacks.forEach((stack) => {
            if (!!stack) {
                this.countMap.set(stack.item, this.getItemCount(stack.item) + stack.count)
            }
        })
    }

    load(stacks: ItemStack[]) {
        // filter out now-invalid items
        stacks = stacks.map((stack) => (ITEM_METADATA_MAP[stack?.item] ? stack : null))

        this.stacks = stacks.map((s) =>
            s === null ? null : new ItemStack(s.item, s.count, s.metadata ?? {})
        )

        this.stacks.forEach((stack) => {
            if (!!stack) {
                this.countMap.set(stack.item, stack.count + (this.countMap.get(stack.item) ?? 0))
            }
        })

        return this
    }
}

let invCache: Record<string, Inventory> = {}
