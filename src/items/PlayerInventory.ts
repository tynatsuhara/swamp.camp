import { Player } from "../characters/Player"
import { saveManager } from "../SaveManager"
import { Inventory, ItemStackMetadata } from "./Inventory"
import { Item } from "./Items"

type SpecialItem = {
    // If true, this item doesn't actually go in the inventory
    noInventorySlot?: boolean
    // Called when the item is added
    onAdd: (number) => void
}

const SPECIAL_ITEMS: { [item: number]: SpecialItem } = {
    [Item.COIN]: {
        noInventorySlot: true,
        onAdd: (count) => {
            saveManager.setState({
                coins: saveManager.getState().coins + count,
            })
        },
    },
    [Item.HEART_CONTAINER]: {
        noInventorySlot: true,
        onAdd: () => {
            Player.instance.dude.maxHealth += 1
            Player.instance.dude.heal(1)
        },
    },
    [Item.CAMPFIRE]: {
        onAdd: () => {
            saveManager.setState({ hasMadeFire: true })
        },
    },
}

export class PlayerInventory extends Inventory {
    addItem(item: Item, count: number = 1, metadata?: ItemStackMetadata): boolean {
        const added = SPECIAL_ITEMS[item]?.noInventorySlot || super.addItem(item, count, metadata)
        if (added) {
            SPECIAL_ITEMS[item]?.onAdd(count)
        }
        return added
    }

    canAddItem(item: Item, count: number = 1): boolean {
        return SPECIAL_ITEMS[item]?.noInventorySlot || super.canAddItem(item, count)
    }
}
