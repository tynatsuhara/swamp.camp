import { Component } from "../../engine/Component"
import { Entity } from "../../engine/Entity"
import { UpdateData } from "../../engine/Engine"
import { InputKey } from "../../engine/Input"
import { UIStateManager } from "./UIStateManager"
import { Point } from "../../engine/Point"
import { ButtonsMenu } from "./ButtonsMenu"
import { Color } from "./Color"
import { saveManager } from "../SaveManager"
import { CutsceneManager } from "../cutscenes/CutsceneManager"
import { makeControlsUI } from "./ControlsUI"
import { BasicRenderComponent } from "../../engine/renderer/BasicRenderComponent"
import { Settings } from "../Settings"
import { TILE_SIZE } from "../graphics/Tilesets"
import { QuestGame } from "../quest_game"

export class PauseMenu extends Component {

    private readonly e: Entity = new Entity([this])  // entity for this component
    private displayEntity: Entity
    private controlsDisplay: Entity
    private isShiftDown: boolean
    isOpen = false

    update(updateData: UpdateData) {
        const pressEsc = updateData.input.isKeyDown(InputKey.ESC)
        this.isShiftDown = updateData.input.isKeyHeld(InputKey.SHIFT)

        if ((pressEsc && this.isOpen) || CutsceneManager.instance.isMidCutscene) {
            this.close()
        } else if (pressEsc && !UIStateManager.instance.isMenuOpen) {
            this.show(updateData.dimensions)
        }
    }

    close() {
        this.isOpen = false
        this.displayEntity = null
        this.controlsDisplay = null
    }

    show(dimensions: Point) {
        const buttons = [
            {
                text: "SAVE GAME", 
                fn: () => saveManager.save(),
            }, 
            {
                text: "LOAD LAST SAVE", 
                fn: () => saveManager.load(),
            }, 
            {
                text: `MUSIC (${Settings.getMusicVolume() * 100}%)`, 
                fn: () => {
                    if (this.isShiftDown) {
                        Settings.decreaseMusicVolume()
                    } else {
                        Settings.increaseMusicVolume()
                    }
                    this.show(dimensions)  // refresh
                },
            }, 
            {
                text: `SOUNDS (${Settings.getSoundVolume() * 100}%)`, 
                fn: () => {
                    if (this.isShiftDown) {
                        Settings.decreaseSoundVolume()
                    } else {
                        Settings.increaseSoundVolume()
                    }
                    this.show(dimensions)  // refresh
                },
            }, 
            {
                text: `MAIN MENU`, 
                fn: () => QuestGame.instance.loadMainMenu(),
            }
        ]

        this.isOpen = true

        const buttonColor = "red"
        const textColor = Color.PINK
        const hoverColor = Color.WHITE

        this.displayEntity = ButtonsMenu.render(
            dimensions,
            "red",
            buttons.map(obj => ({ ...obj, buttonColor, textColor, hoverColor })),
            new Point(0, 20)
        )

        this.controlsDisplay = new Entity([new BasicRenderComponent(...makeControlsUI(dimensions, new Point(0, -TILE_SIZE/2)))])
    }

    getEntities(): Entity[] {
        return [
            this.e, 
            this.displayEntity,
            this.controlsDisplay
        ]
    }
}