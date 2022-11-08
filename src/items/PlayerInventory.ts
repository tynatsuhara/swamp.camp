import { player } from "../characters/player"
import { syncFn } from "../online/sync"
import { saveManager } from "../SaveManager"
import { Notification, NotificationDisplay } from "../ui/NotificationDisplay"
import { Inventory, ItemStackMetadata } from "./Inventory"
import { Item, ITEM_METADATA_MAP } from "./Items"

type SpecialItem = {
    // If true, this item doesn't actually go in the inventory
    noInventorySlot?: boolean
    // Called when the item is added. Only runs on the host!
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
            player().maxHealth += 1
            player().heal(1)
        },
    },
    [Item.CAMPFIRE]: {
        onAdd: () => {
            saveManager.setState({ hasMadeFire: true })
        },
    },
}

export class PlayerInventory extends Inventory {
    private showNotifications: boolean

    constructor(showNotifications: boolean, syncIdPrefix: string, size?: number) {
        super(syncIdPrefix, size)
        this.showNotifications = showNotifications

        const addItem = this.addItem

        const pushNotification = syncFn(`${syncIdPrefix}pn`, (item: Item, count: number) => {
            const itemData = ITEM_METADATA_MAP[item]
            const id = `add-inv-${item}`
            const existing = NotificationDisplay.instance.getById(id)
            const updatedCount = (existing?.count ?? 0) + count
            const n: Notification & { id: string } = {
                id,
                text: `+${updatedCount} ${itemData.displayName}`,
                icon: itemData.inventoryIcon,
                count: updatedCount,
            }
            if (existing) {
                NotificationDisplay.instance.replace(n)
            } else {
                NotificationDisplay.instance.push(n)
            }
        })

        this.addItem = (item, count = 1, metadata = {}, quiet = false) => {
            const added = SPECIAL_ITEMS[item]?.noInventorySlot || addItem(item, count, metadata)

            if (added) {
                // Apply special side effects
                SPECIAL_ITEMS[item]?.onAdd(count)

                // Push a notification, if appropriate
                if (this.showNotifications && !quiet && NotificationDisplay.instance) {
                    pushNotification(item, count)
                }
            }

            return added
        }
    }

    addItem: (item: Item, count?: number, metadata?: ItemStackMetadata, quiet?: boolean) => boolean

    canAddItem(item: Item, count: number = 1): boolean {
        return SPECIAL_ITEMS[item]?.noInventorySlot || super.canAddItem(item, count)
    }
}
