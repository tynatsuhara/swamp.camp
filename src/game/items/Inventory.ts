import { Item, ITEM_METADATA_MAP } from "./Items"

export class ItemStack {
    readonly item: Item
    count: number

    constructor(
        item: Item, 
        count: number
    ) {
        this.item = item
        this.count = count
    }
}

// TODO flesh this out more when we have more items
export class Inventory {
    private _inventory: ItemStack[]
    get inventory() { return this._inventory }
    private countMap = new Map<Item, number>()

    constructor(size: number = 20) {
        this._inventory = Array.from({ length: size })
    }

    /**
     * returns true if the item can fit in the inventory
     */
    addItem(item: Item): boolean {
        let firstEmptySlot = -1
        for (let i = 0; i < this.inventory.length; i++) {
            const slotValue = this.inventory[i]
            if (!!slotValue) {
                if (slotValue.item === item && slotValue.count < ITEM_METADATA_MAP[item].stackLimit) {
                    slotValue.count++
                    this.countMap.set(item, 1 + (this.countMap.get(item) ?? 0))
                    return true
                }
            } else if (firstEmptySlot === -1) {
                firstEmptySlot = i
            }
        }

        if (firstEmptySlot !== -1) {
            this.inventory[firstEmptySlot] = new ItemStack(item, 1)
            this.countMap.set(item, 1 + (this.countMap.get(item) ?? 0))
            return true
        }

        return false
    }

    canAddItem(item: Item): boolean {
        let firstEmptySlot = -1
        for (let i = 0; i < this.inventory.length; i++) {
            const slotValue = this.inventory[i]
            if (!!slotValue) {
                if (slotValue.item === item && slotValue.count < ITEM_METADATA_MAP[item].stackLimit) {
                    return true
                }
            } else if (firstEmptySlot === -1) {
                firstEmptySlot = i
            }
        }

        if (firstEmptySlot !== -1) {
            return true
        }

        return false
    }

    removeItem(item: Item, count: number = 1) {
        const currentCount = this.getItemCount(item)
        if (currentCount < count) {
            throw new Error("inventory cannot go negative")
        }
        this.countMap.set(item, currentCount-count)

        for (let i = 0; i < this.inventory.length; i++) {
            const slotValue = this.inventory[i]
            if (slotValue?.item === item) {
                while (slotValue.count > 0 && count > 0) {
                    count--
                    slotValue.count--
                }
                if (slotValue.count === 0) {
                    this.inventory[i] = null
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
        return this.inventory
    }

    static load(stacks: ItemStack[]) {
        const inv = new Inventory()
        inv._inventory = stacks
        stacks.forEach(stack => {
            if (!!stack) {
                inv.countMap.set(stack.item, stack.count + (inv.countMap.get(stack.item) ?? 0))
            }
        })
        return inv
    }
}