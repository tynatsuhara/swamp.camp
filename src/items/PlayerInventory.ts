import { Dude } from "../characters/Dude"
import { player } from "../characters/player"
import { ShieldType } from "../characters/weapons/ShieldType"
import { WeaponType } from "../characters/weapons/WeaponType"
import { syncFn } from "../online/syncUtils"
import { saveManager } from "../SaveManager"
import { InventoryDisplay } from "../ui/InventoryDisplay"
import { Notification, NotificationDisplay } from "../ui/NotificationDisplay"
import { Inventory, ItemStackMetadata } from "./Inventory"
import { Item, ITEM_METADATA_MAP } from "./Items"

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

        const equipOnAdd = (item: Item, metadata: ItemStackMetadata) => {
            const itemData = ITEM_METADATA_MAP[item]
            const dude = Dude.get(playerUUID)
            if (!dude) {
                return // probably happening during save loading
            }

            // If already equipped, make sure it lines up
            if (metadata.equipped === "weapon") {
                Dude.get(playerUUID)?.setWeapon(itemData.equippableWeapon, -1)
            } else if (metadata.equipped === "shield") {
                Dude.get(playerUUID)?.setShield(itemData.equippableShield, -1)
            }

            // Automatically equip if slots are empty
            if (dude.weaponType === WeaponType.NONE && itemData.equippableWeapon) {
                dude.equipFirstWeaponInInventory()
            } else if (dude.shieldType === ShieldType.NONE && itemData.equippableShield) {
                dude.equipFirstShieldInInventory()
            }
        }

        const addItem = this.addItem.bind(this)
        this.addItem = (item, count = 1, metadata = {}, quiet = false) => {
            const added = SPECIAL_ITEMS[item]?.noInventorySlot || addItem(item, count, metadata)

            if (added) {
                equipOnAdd(item, metadata)

                // Apply special side effects
                SPECIAL_ITEMS[item]?.onAdd(count)

                // Push a notification, if appropriate
                if (!quiet && NotificationDisplay.instance) {
                    pushNotification(item, count)
                }
            }

            return added
        }

        const setStack = this.setStack.bind(this)
        this.setStack = (index, stack) => {
            equipOnAdd(stack.item, stack.metadata)
            setStack(index, stack)
        }
    }

    addItem: (item: Item, count?: number, metadata?: ItemStackMetadata, quiet?: boolean) => boolean

    canAddItem(item: Item, count: number = 1, metadata: ItemStackMetadata = {}): boolean {
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
