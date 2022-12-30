import { Component } from "brigsby/dist/Component"
import { Entity } from "brigsby/dist/Entity"
import { controls } from "../Controls"
import { Singletons } from "../Singletons"
import { PauseMenu } from "./PauseMenu"
import { Tooltip } from "./Tooltip"

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

        const showControl = (buttonString: string, action: string) => {
            controlsToShow.push(buttonString + " " + action)
        }

        if (PauseMenu.instance.isOpen) {
            showControl(controls.getCloseMenuButtonString(), "close")
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
