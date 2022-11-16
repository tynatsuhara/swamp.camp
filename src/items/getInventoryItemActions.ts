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
import { ItemStack } from "./Inventory"
import { ItemSpec } from "./Items"

export type ItemAction = {
    verb: string
    actionFn: () => void
}

// MPTODO
const consume = clientSyncFn("consume", (_, dudeUUID: string, invIndex: number) => {
    if (session.isHost()) {
        const inv = Dude.get(dudeUUID).inventory
        let stack = inv.getStack(invIndex)
        stack = stack.withCount(stack.count - 1)
        inv.setStack(invIndex, stack)
    }
})

export const getInventoryItemActions = (
    item: ItemSpec,
    stack: ItemStack,
    decrementStack: () => void
): ItemAction[] => {
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
                PlaceElementDisplay.instance.startPlacing(stack.count, stack, decrementStack)
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
                consumeFn()
                decrementStack()
                InventoryDisplay.instance.refreshView()
            },
        })
    }

    return actions
}
