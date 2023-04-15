import { Component } from "brigsby/dist/Component"
import { Entity } from "brigsby/dist/Entity"
import { controls } from "../Controls"
import { Singletons } from "../Singletons"
import { CraftingMenu } from "./CraftingMenu"
import { InventoryDisplay } from "./InventoryDisplay"
import { PauseMenu } from "./PauseMenu"
import { PlaceElementDisplay } from "./PlaceElementDisplay"
import { Tooltip } from "./Tooltip"
import { TradeMenu } from "./TradeMenu"

/**
 * Show controls in the corner for various menus
 */
export class MenuHints extends Component {
    private readonly e = new Entity([this])
    private display: Tooltip

    static get instance() {
        return Singletons.getOrCreate(MenuHints)
    }

    awake(): void {
        this.display = this.entity.addComponent(new Tooltip("bottom-left"))
    }

    update(): void {
        const controlsToShow: string[] = []

        const show = (button: string, action: string) => controlsToShow.push(`${button} ${action}`)
        const showExit = () => show(controls.getCloseMenuButtonString(), "exit")

        if (InventoryDisplay.instance.isOpen) {
            const { isHoveringItem, isStackHeld, isTrading } = InventoryDisplay.instance
            if (isHoveringItem && !isStackHeld) {
                show(controls.getInventoryStackPickUpOrDropString(), "pick up")
                show(controls.getInventoryStackPickUpHalfOrDropOneString(), "pick up half")
                if (!controls.isGamepadMode()) {
                    show("[0-9]", "set hotkey")
                }
            } else if (isStackHeld) {
                show(controls.getInventoryStackPickUpOrDropString(), "drop")
                show(controls.getInventoryStackPickUpHalfOrDropOneString(), "drop one")
            }
            if (isTrading && !isStackHeld && isHoveringItem) {
                show(controls.getInventorySwapString(), "swap")
            }
            showExit()
        } else if (PlaceElementDisplay.instance.isOpen) {
            show(controls.getMenuClickDownString(), "place")
            showExit()
        } else if (PauseMenu.instance.isOpen) {
            show(controls.getCycleTipString(), "tips")
            showExit()
        } else if (CraftingMenu.instance.isOpen) {
            show(controls.getTabButtonsString(), "tab left/right")
            showExit()
        } else if (TradeMenu.instance.isOpen) {
            showExit()
        }

        if (controlsToShow.length > 0) {
            this.display.say(controlsToShow.join("\n"))
        } else {
            this.display.clear()
        }
    }

    getEntities() {
        return [this.e]
    }
}
