import { Component } from "../../engine/component"
import { Entity } from "../../engine/Entity"
import { UpdateData } from "../../engine/engine"
import { InputKey } from "../../engine/input"
import { UIStateManager } from "./UIStateManager"
import { Point } from "../../engine/point"

export class PauseMenu extends Component {

    private readonly e: Entity = new Entity([this])  // entity for this component
    private displayEntity: Entity
    isOpen = false

    update(updateData: UpdateData) {
        const pressEsc = updateData.input.isKeyDown(InputKey.ESC)

        if (pressEsc && this.isOpen) {
            this.close()
        } else if (pressEsc && !UIStateManager.instance.isMenuOpen) {
            this.show(updateData.dimensions)
        }
    }

    close() {
        this.isOpen = false
        console.log("closed pause menu")
    }

    show(dimensions: Point) {
        this.isOpen = true
        console.log("opened pause menu")
    }

    getEntities(): Entity[] {
        return [this.e]
    }
}