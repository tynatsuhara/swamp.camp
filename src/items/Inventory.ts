import { InputKey } from "brigsby/dist"
import { stringifySorted } from "../debug/JSON"
import { syncFn } from "../online/utils"
import { Item, ItemMetadata, ITEM_METADATA_MAP } from "./Items"

export type ItemStackMetadata = ItemMetadata & {
    hotKey?: InputKey
}

export class ItemStack {
    readonly item: Item
    count: number
    readonly metadata: ItemStackMetadata

    constructor(item: Item, count: number, metadata: ItemStackMetadata = {}) {
        this.item = item
        this.count = count
        this.metadata = metadata
    }
}

const doesMetadataMatch = (a: ItemStackMetadata, b: ItemStackMetadata) => {
    // ignore hotkey — we just put it in the metadata for easy serialization
    a = { ...a, hotKey: undefined }
    b = { ...b, hotKey: undefined }
    return stringifySorted(a) === stringifySorted(b)
}

export class Inventory {
    private stacks: ItemStack[]
    private countMap = new Map<Item, number>()

    /**
     * @param syncIdPrefix a unique identifier used for sync functions, max len 10 characters
     */
    constructor(syncIdPrefix: string, size: number = 20) {
        this.stacks = Array.from({ length: size })
        this.addItem = syncFn(`${syncIdPrefix}ai`, this._addItem)
    }

    get size() {
        return this.stacks.length
    }

    getStack(index: number): ItemStack {
        return this.stacks[index]
    }

    getStacks() {
        return this.stacks.filter((s) => !!s)
    }

    setStack(index: number, stack: ItemStack) {
        this.stacks[index] = stack
        this.recomputeCountsMap()
    }

    /**
     * returns true if the item was successfully added
     */
    addItem: (item: Item, count?: number, metadata?: ItemStackMetadata) => boolean
    private _addItem: typeof this.addItem = (item, count = 1, metadata = {}) => {
        const canAdd = this.canAddItem(item, count)
        if (!canAdd) {
            return false
        }

        const stackLimit = ITEM_METADATA_MAP[item].stackLimit

        let leftToAdd = count

        // First, add to existing stacks to preserve space.
        for (let i = 0; i < this.stacks.length && leftToAdd > 0; i++) {
            const slotValue = this.stacks[i]
            if (slotValue?.item === item && doesMetadataMatch(slotValue.metadata, metadata)) {
                const addedHere = Math.min(stackLimit - slotValue.count, leftToAdd)
                slotValue.count += addedHere
                leftToAdd -= addedHere
            }
        }

        // Then add to empty slots
        for (let i = 0; i < this.stacks.length && leftToAdd > 0; i++) {
            const slotValue = this.stacks[i]
            if (!slotValue) {
                const addedHere = Math.min(stackLimit, leftToAdd)
                leftToAdd -= addedHere
                this.stacks[i] = new ItemStack(item, addedHere, metadata)
            }
        }

        this.recomputeCountsMap()

        return true
    }

    canAddItem(item: Item, count: number = 1): boolean {
        const stackLimit = ITEM_METADATA_MAP[item].stackLimit

        let availableRoom = 0

        for (let i = 0; i < this.stacks.length && availableRoom < count; i++) {
            const slotValue = this.stacks[i]
            if (!slotValue) {
                availableRoom += stackLimit
            } else if (slotValue.item === item) {
                availableRoom += stackLimit - slotValue.count
            }
        }

        return availableRoom >= count
    }

    removeItem(item: Item, count: number = 1) {
        const currentCount = this.getItemCount(item)
        if (currentCount < count) {
            console.error("inventory cannot go negative")
            return
        }
        this.countMap.set(item, currentCount - count)

        for (let i = 0; i < this.stacks.length; i++) {
            const slotValue = this.stacks[i]
            if (slotValue?.item === item) {
                while (slotValue.count > 0 && count > 0) {
                    count--
                    slotValue.count--
                }
                if (slotValue.count === 0) {
                    this.stacks[i] = null
                }
                if (count === 0) {
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
