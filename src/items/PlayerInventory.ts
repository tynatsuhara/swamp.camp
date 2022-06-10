import { Player } from "../characters/Player"
import { saveManager } from "../SaveManager"
import { Inventory } from "./Inventory"
import { Item } from "./Items"

export class PlayerInventory extends Inventory {
    addItem(item: Item, count: number = 1): boolean {
        if (this.specialItemCheck(item, count, true)) {
            return true
        }
        return super.addItem(item, count)
    }

    canAddItem(item: Item, count: number = 1): boolean {
        if (this.specialItemCheck(item, count, false)) {
            return true
        }
        return super.canAddItem(item, count)
    }

    /**
     * This function can be used to check if an item is special. Special items
     * are not actually added to or removed from an inventory slot. For instance,
     * items which will trigger an effect on the player as soon as they get them.
     *
     * @param item the item type
     * @param doSideEffect whether or not the item should be added/removed
     * @returns true if this item is special and doesn't take an inventory slot
     */
    private specialItemCheck(item: Item, count: number, doSideEffect: boolean): boolean {
        switch (item) {
            case Item.COIN:
                if (doSideEffect) {
                    saveManager.setState({
                        coins: saveManager.getState().coins + count,
                    })
                }
                return true
            case Item.HEART_CONTAINER:
                if (doSideEffect) {
                    Player.instance.dude.maxHealth += 1
                    Player.instance.dude.heal(1)
                }
                return true
            case Item.CAMPFIRE:
                if (doSideEffect) {
                    saveManager.setState({ hasMadeFire: true })
                }
                return false
            default:
                return false
        }
    }
}
