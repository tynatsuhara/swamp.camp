import { Dude } from "../characters/Dude"
import { player } from "../characters/player"
import { ShieldType } from "../characters/weapons/ShieldType"
import { WeaponType } from "../characters/weapons/WeaponType"
import { syncFn } from "../online/utils"
import { saveManager } from "../SaveManager"
import { InventoryDisplay } from "../ui/InventoryDisplay"
import { Notification, NotificationDisplay } from "../ui/NotificationDisplay"
import { Inventory } from "./Inventory"
import { Item, ItemMetadata, ITEM_METADATA_MAP } from "./Items"

type SpecialItem = {
    // If true, this item doesn't actually go in the inventory
    noInventorySlot?: boolean
    // Called when the item is added. Only runs on the host!
    onAdd: (count: number) => void
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
    private playerUUID: string

    constructor(playerUUID: string) {
        const syncIdPrefix = Dude.createSyncId(playerUUID, "iv")

        super(syncIdPrefix, false)

        this.playerUUID = playerUUID

        const pushNotification = syncFn(`${syncIdPrefix}pn`, (item: Item, count: number) => {
            if (player().uuid === playerUUID && !InventoryDisplay.instance.isOpen) {
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
            }
        })

        this.addItem = (item, count = 1, metadata = {}, quiet = false) => {
            const added =
                SPECIAL_ITEMS[item]?.noInventorySlot || super.addItem(item, count, metadata)

            if (added) {
                // Apply special side effects
                SPECIAL_ITEMS[item]?.onAdd(count)

                // Push a notification, if appropriate
                if (!quiet && NotificationDisplay.instance) {
                    pushNotification(item, count)
                }
            }

            return added
        }
    }

    addItem: (item: Item, count?: number, metadata?: ItemMetadata, quiet?: boolean) => boolean

    canAddItem(item: Item, count: number = 1, metadata: ItemMetadata = {}): boolean {
        return SPECIAL_ITEMS[item]?.noInventorySlot || super.canAddItem(item, count, metadata)
    }

    removeItemAtIndex(index: number, amountToRemove = 1): void {
        const beforeRemoval = this.getStack(index)
        super.removeItemAtIndex(index, amountToRemove)
        const afterRemoval = this.getStack(index)

        if (!afterRemoval) {
            const equipped = beforeRemoval?.metadata?.equipped
            if (equipped === "weapon") {
                Dude.get(this.playerUUID).setWeapon(WeaponType.UNARMED, -1)
            } else if (equipped === "shield") {
                Dude.get(this.playerUUID).setShield(ShieldType.NONE, -1)
            }
        }
    }
}
