import { Point } from "brigsby/dist/Point"
import { Dude } from "../characters/Dude"
import { player } from "../characters/player/index"
import { ShieldType } from "../characters/weapons/ShieldType"
import { WeaponType } from "../characters/weapons/WeaponType"
import { session } from "../online/session"
import { clientSyncFn } from "../online/syncUtils"
import { DonatingOptions, InventoryDisplay } from "../ui/InventoryDisplay"
import { PlaceElementDisplay } from "../ui/PlaceElementDisplay"
import { Elements } from "../world/elements/Elements"
import { here } from "../world/locations/LocationManager"
import { ITEM_METADATA_MAP } from "./Items"

export type ItemAction = {
    verb: string
    actionFn: () => void
}

// place the item at a given inventory index
const placeOnHost = clientSyncFn(
    "place",
    "host-only",
    ({ dudeUUID }, invIndex: number, elementPos: Point) => {
        const dude = Dude.get(dudeUUID)
        const inv = dude.inventory
        const stack = inv.getStack(invIndex)

        PlaceElementDisplay.instance.finishPlacingOnHost(stack, elementPos)

        inv.removeItemAtIndex(invIndex, 1)
    }
)

// consume the item at a given inventory index
const consume = clientSyncFn("consume", "caller-and-host", ({ dudeUUID }, invIndex: number) => {
    const dude = Dude.get(dudeUUID)
    const stack = dude.inventory.getStack(invIndex)
    ITEM_METADATA_MAP[stack.item].consumable?.fn(dude)

    if (session.isHost()) {
        dude.inventory.removeItemAtIndex(invIndex, 1)
    }
})

// donate the item at a given inventory index
const donate = clientSyncFn("donate", "caller-and-host", ({ dudeUUID }, invIndex: number) => {
    const dude = Dude.get(dudeUUID)
    if (session.isHost()) {
        dude.inventory.removeItemAtIndex(invIndex, 1)
    }
})

export const getInventoryItemActions = (playerInvIndex: number): ItemAction[] => {
    const stack = player().inventory.getStack(playerInvIndex)
    const item = ITEM_METADATA_MAP[stack.item]

    const wl = here()
    const actions: ItemAction[] = []

    if (item.equippableWeapon) {
        if (!stack.metadata.equipped) {
            actions.push({
                verb: "equip",
                actionFn: () => {
                    player().setWeapon(item.equippableWeapon, playerInvIndex) // client sync fn
                    InventoryDisplay.instance.refreshView()
                },
            })
        } else {
            actions.push({
                verb: "unequip",
                actionFn: () => {
                    player().setWeapon(WeaponType.UNARMED, -1) // client sync fn
                    InventoryDisplay.instance.refreshView()
                },
            })
        }
    }

    if (item.equippableShield) {
        if (!stack.metadata.equipped) {
            actions.push({
                verb: "equip off-hand",
                actionFn: () => {
                    player().setShield(item.equippableShield, playerInvIndex) // client sync fn
                    InventoryDisplay.instance.refreshView()
                },
            })
        } else {
            actions.push({
                verb: "unequip",
                actionFn: () => {
                    player().setShield(ShieldType.NONE, -1) // client sync fn
                    InventoryDisplay.instance.refreshView()
                },
            })
        }
    }

    if (
        item.element !== null &&
        wl.allowPlacing &&
        Elements.instance.getElementFactory(item.element).canPlaceInLocation(wl)
    ) {
        actions.push({
            verb: "place",
            actionFn: () => {
                InventoryDisplay.instance.close()
                const stack = player().inventory.getStack(playerInvIndex)
                PlaceElementDisplay.instance.startPlacing(stack, (elementPos) =>
                    placeOnHost(playerInvIndex, elementPos)
                )
            },
        })
    }

    if (item.consumable) {
        const { verb } = item.consumable
        actions.push({
            verb,
            actionFn: () => {
                consume(playerInvIndex)
                InventoryDisplay.instance.refreshView()
            },
        })
    }

    return actions
}

export const getInventoryItemDonationActions = (
    playerInvIndex: number,
    { canDonate, onDonate, verb }: DonatingOptions
): ItemAction[] => {
    const stack = player().inventory.getStack(playerInvIndex)
    if (!canDonate(stack)) {
        return []
    }
    return [
        {
            verb,
            actionFn: () => {
                donate(playerInvIndex)
                InventoryDisplay.instance.refreshView()
                onDonate()
            },
        },
    ]
}
