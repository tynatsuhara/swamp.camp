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
        const showClose = () => show(controls.getCloseMenuButtonString(), "close")

        // TODO add all controls
        if (InventoryDisplay.instance.isOpen) {
            showClose()
        } else if (PlaceElementDisplay.instance.isOpen) {
            showClose()
        } else if (PauseMenu.instance.isOpen) {
            showClose()
        } else if (CraftingMenu.instance.isOpen) {
            showClose()
        } else if (TradeMenu.instance.isOpen) {
            showClose()
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
