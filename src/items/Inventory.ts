import { Item, ITEM_METADATA_MAP } from "./Items"

export class ItemStack {
    readonly item: Item
    count: number

    constructor(item: Item, count: number) {
        this.item = item
        this.count = count
    }
}

// TODO flesh this out more when we have more items
export class Inventory {
    private stacks: ItemStack[]
    private countMap = new Map<Item, number>()

    constructor(size: number = 20) {
        this.stacks = Array.from({ length: size })
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
    addItem(item: Item, count: number = 1): boolean {
        const canAdd = this.canAddItem(item, count)
        if (!canAdd) {
            return false
        }

        const stackLimit = ITEM_METADATA_MAP[item].stackLimit

        let leftToAdd = count

        // First, add to existing stacks to preserve space
        for (let i = 0; i < this.stacks.length && leftToAdd > 0; i++) {
            const slotValue = this.stacks[i]
            if (slotValue?.item === item) {
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
                this.stacks[i] = new ItemStack(item, addedHere)
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
            throw new Error("inventory cannot go negative")
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

    static load(stacks: ItemStack[]) {
        const inv = new this()

        // filter out now-invalid items
        stacks = stacks.map((stack) => (ITEM_METADATA_MAP[stack?.item] ? stack : null))

        inv.stacks = stacks
        stacks.forEach((stack) => {
            if (!!stack) {
                inv.countMap.set(stack.item, stack.count + (inv.countMap.get(stack.item) ?? 0))
            }
        })
        return inv
    }
}
