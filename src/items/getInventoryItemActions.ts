import { Point } from "brigsby/dist/Point"
import { profiler } from "brigsby/dist/Profiler"
import { Dude } from "../characters/Dude"
import { player } from "../characters/player/index"
import { prettyPrint } from "../debug/JSON"
import { session } from "../online/session"
import { clientSyncFn } from "../online/utils"
import { InventoryDisplay } from "../ui/InventoryDisplay"
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
        const inv = Dude.get(dudeUUID).inventory
        const stack = inv.getStack(invIndex)

        PlaceElementDisplay.instance.finishPlacingOnHost(stack, elementPos)

        inv.setStack(invIndex, stack.withCount(stack.count - 1))
    }
)

// consume the item at a given inventory index
const consume = clientSyncFn("consume", "caller-and-host", ({ dudeUUID }, invIndex: number) => {
    const dude = Dude.get(dudeUUID)
    const stack = dude.inventory.getStack(invIndex)
    ITEM_METADATA_MAP[stack.item].consumable?.fn(dude)

    if (session.isHost()) {
        dude.inventory.setStack(invIndex, stack.withCount(stack.count - 1))
    }
})

export const getInventoryItemActions = (playerInvIndex: number): ItemAction[] => {
    const stack = player().inventory.getStack(playerInvIndex)
    const item = ITEM_METADATA_MAP[stack.item]

    profiler.showInfo(`item metadata: ${prettyPrint(stack.metadata)}`)
    const wl = here()
    const actions: ItemAction[] = []

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

    if (item.equippableWeapon) {
        if (player().weaponType !== item.equippableWeapon) {
            actions.push({
                verb: "equip",
                actionFn: () => {
                    player().setWeapon(item.equippableWeapon) // client sync fn
                    InventoryDisplay.instance.refreshView()
                },
            })
        }
    }

    if (item.equippableShield) {
        if (player().shieldType !== item.equippableShield) {
            actions.push({
                verb: "equip off-hand",
                actionFn: () => {
                    player().setShield(item.equippableShield) // client sync fn
                    InventoryDisplay.instance.refreshView()
                },
            })
        }
    }

    if (item.consumable) {
        const { verb, fn: consumeFn } = item.consumable
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
