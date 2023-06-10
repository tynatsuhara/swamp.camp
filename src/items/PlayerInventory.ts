import { Dude } from "../characters/Dude"
import { player } from "../characters/player"
import { ShieldType } from "../characters/weapons/ShieldType"
import { WeaponType } from "../characters/weapons/WeaponType"
import { saveManager } from "../core/SaveManager"
import { syncFn } from "../online/syncUtils"
import { InventoryDisplay } from "../ui/InventoryDisplay"
import { Notification, NotificationDisplay } from "../ui/NotificationDisplay"
import { Inventory, ItemStack, ItemStackMetadata } from "./Inventory"
import { Item } from "./Item"
import { ITEM_METADATA_MAP } from "./Items"

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
    constructor(private readonly playerUUID: string) {
        const syncIdPrefix = Dude.createSyncId(playerUUID, "iv")

        super(syncIdPrefix, false)

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

        const addItem = this.addItem.bind(this)
        this.addItem = (item, count = 1, metadata = {}, quiet = false) => {
            const added = SPECIAL_ITEMS[item]?.noInventorySlot || addItem(item, count, metadata)

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

    addItem: (item: Item, count?: number, metadata?: ItemStackMetadata, quiet?: boolean) => boolean

    canAddItem(item: Item, count: number = 1, metadata: ItemStackMetadata = {}): boolean {
        return SPECIAL_ITEMS[item]?.noInventorySlot || super.canAddItem(item, count, metadata)
    }

    setStack(index: number, stack: Pick<ItemStack, "item" | "count" | "metadata">): void {
        const beforeUpdate = this.getStack(index)
        super.setStack(index, stack)
        const afterUpdate = this.getStack(index)

        // unequip
        if (beforeUpdate?.metadata?.equipped && !afterUpdate?.metadata?.equipped) {
            const equipped = beforeUpdate.metadata.equipped
            if (equipped === "weapon") {
                Dude.get(this.playerUUID).setWeapon(WeaponType.UNARMED, -1)
            } else if (equipped === "shield") {
                Dude.get(this.playerUUID).setShield(ShieldType.NONE, -1)
            }
        }

        // equip
        if (afterUpdate?.metadata?.equipped && !beforeUpdate?.metadata?.equipped) {
            const equipped = afterUpdate.metadata.equipped
            if (equipped === "weapon") {
                Dude.get(this.playerUUID)?.setWeapon(
                    ITEM_METADATA_MAP[stack.item].equippableWeapon,
                    index
                )
            } else if (equipped === "shield") {
                Dude.get(this.playerUUID)?.setShield(
                    ITEM_METADATA_MAP[stack.item].equippableShield,
                    index
                )
            }
        }
    }
}
