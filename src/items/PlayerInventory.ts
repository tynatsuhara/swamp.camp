import { Player } from "../characters/Player"
import { saveManager } from "../SaveManager"
import { Notification, NotificationDisplay } from "../ui/NotificationDisplay"
import { Inventory, ItemStackMetadata } from "./Inventory"
import { Item, ITEM_METADATA_MAP } from "./Items"

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

            if (NotificationDisplay.instance) {
                const itemData = ITEM_METADATA_MAP[item]
                const id = `add-inv-${item}`
                const existing = NotificationDisplay.instance.getById(id)
                const count = (existing?.count ?? 0) + 1
                const n: Notification & { id: string } = {
                    id,
                    text: `+${count} ${itemData.displayName}`,
                    icon: itemData.inventoryIcon,
                    count,
                }
                if (existing) {
                    NotificationDisplay.instance.replace(n)
                } else {
                    NotificationDisplay.instance.push(n)
                }
            }
        }
        return added
    }

    canAddItem(item: Item, count: number = 1): boolean {
        return SPECIAL_ITEMS[item]?.noInventorySlot || super.canAddItem(item, count)
    }
}
