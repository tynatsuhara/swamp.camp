import { Component } from "../../engine/component"
import { Entity } from "../../engine/Entity"
import { UpdateData } from "../../engine/engine"
import { InputKey } from "../../engine/input"
import { UIStateManager } from "./UIStateManager"
import { Point } from "../../engine/point"
import { ButtonsMenu } from "./ButtonsMenu"
import { Color } from "./Color"
import { SaveManager } from "../SaveManager"
import { CutsceneManager } from "../cutscenes/CutsceneManager"

export class PauseMenu extends Component {

    private readonly e: Entity = new Entity([this])  // entity for this component
    private displayEntity: Entity
    isOpen = false

    update(updateData: UpdateData) {
        const pressEsc = updateData.input.isKeyDown(InputKey.ESC)

        if (pressEsc && this.isOpen) {
            this.close()
        } else if (pressEsc && !UIStateManager.instance.isMenuOpen && !CutsceneManager.instance.isMidCutscene) {
            this.show(updateData.dimensions)
        }
    }

    close() {
        this.isOpen = false
        this.displayEntity = null
    }

    show(dimensions: Point) {
        this.isOpen = true
        this.displayEntity = ButtonsMenu.render(
            dimensions,
            "red",
            [{
                text: "Save game".toUpperCase(), 
                fn: () => SaveManager.instance.save(),
                buttonColor: "red",
                textColor: Color.RED,
                hoverColor: Color.WHITE
            },
            {
                text: "Load last save".toUpperCase(), 
                fn: () => SaveManager.instance.load(),
                buttonColor: "red",
                textColor: Color.RED,
                hoverColor: Color.WHITE
            }]
        )
    }

    getEntities(): Entity[] {
        return [this.e, this.displayEntity]
    }
}