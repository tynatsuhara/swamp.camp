import { Item } from "./Items"

class ItemStack {
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
    readonly inventory: ItemStack[] = Array.from({ length: 20 })
    private readonly countMap = new Map<Item, number>()

    /**
     * returns true if the item can fit in the inventory
     */
    addItem(item: Item): boolean {
        let firstEmptySlot = -1
        for (let i = 0; i < this.inventory.length; i++) {
            const slotValue = this.inventory[i]
            if (!!slotValue) {
                if (slotValue.item === item && slotValue.count < item.stackLimit) {
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

    /**
     * Returns the total amount of an item in the inventory
     */
    getItemCount(item: Item): number {
        return this.countMap.get(item) ?? 0
    }
}