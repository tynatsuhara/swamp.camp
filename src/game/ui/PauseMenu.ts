import { Component } from "../../engine/component"
import { Entity } from "../../engine/Entity"
import { UpdateData } from "../../engine/engine"
import { InputKey } from "../../engine/input"
import { UIStateManager } from "./UIStateManager"
import { Point } from "../../engine/point"
import { ButtonsMenu } from "./ButtonsMenu"
import { Color } from "./Color"
import { saveManager } from "../SaveManager"
import { CutsceneManager } from "../cutscenes/CutsceneManager"
import { makeControlsUI } from "./ControlsUI"
import { BasicRenderComponent } from "../../engine/renderer/BasicRenderComponent"
import { Settings } from "../Settings"
import { TILE_SIZE } from "../graphics/Tilesets"

export class PauseMenu extends Component {

    private readonly e: Entity = new Entity([this])  // entity for this component
    private displayEntity: Entity
    private controlsDisplay: Entity
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
        this.controlsDisplay = null
    }

    show(dimensions: Point) {
        this.isOpen = true
        const buttonColor = "red"
        const textColor = Color.PINK
        const hoverColor = Color.WHITE
        this.displayEntity = ButtonsMenu.render(
            dimensions,
            "red",
            [{
                text: "SAVE GAME", 
                fn: () => saveManager.save(),
                buttonColor, textColor, hoverColor,
            }, {
                text: "LOAD LAST SAVE", 
                fn: () => saveManager.load(),
                buttonColor, textColor, hoverColor,
            }, {
                text: `MUSIC (${Settings.getMusicVolume() * 100}%)`, 
                fn: () => {
                    Settings.bumpMusicVolume()
                    this.show(dimensions)  // refresh
                },
                buttonColor, textColor, hoverColor,
            }, {
                text: `SOUNDS (${Settings.getSoundVolume() * 100}%)`, 
                fn: () => {
                    Settings.bumpSoundVolume()
                    this.show(dimensions)  // refresh
                },
                buttonColor, textColor, hoverColor,
            }],
            new Point(0, TILE_SIZE/2)
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