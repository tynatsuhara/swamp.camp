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

        const show = (buttonString: string, action: string) => {
            controlsToShow.push(buttonString + " " + action)
        }
        const showExit = () => show(controls.getCloseMenuButtonString(), "exit")

        if (InventoryDisplay.instance.isOpen) {
            if (!InventoryDisplay.instance.isStackHeld) {
                show(controls.getInventoryStackPickUpOrDropString(), "pick up")
                show(controls.getInventoryStackPickUpHalfOrDropOneString(), "pick up half")
            } else {
                show(controls.getInventoryStackPickUpOrDropString(), "drop")
                show(controls.getInventoryStackPickUpHalfOrDropOneString(), "drop one")
            }
            if (InventoryDisplay.instance.isTrading && !InventoryDisplay.instance.isStackHeld) {
                show(controls.getInventorySwapString(), "swap")
            }
            showExit()
        } else if (PlaceElementDisplay.instance.isOpen) {
            // TODO
            showExit()
        } else if (PauseMenu.instance.isOpen) {
            // TODO
            showExit()
        } else if (CraftingMenu.instance.isOpen) {
            // TODO
            showExit()
        } else if (TradeMenu.instance.isOpen) {
            // TODO
            showExit()
        }

        if (controlsToShow.length > 0) {
            this.display.say(controlsToShow.join("\n"))
        } else {
            this.display.clear()
        }
    }

    show() {}

    getEntities() {
        return [this.e]
    }
}
