import { Component } from "brigsby/dist/Component"
import { UpdateData } from "brigsby/dist/Engine"
import { Entity } from "brigsby/dist/Entity"
import { Point } from "brigsby/dist/Point"
import { BasicRenderComponent } from "brigsby/dist/renderer/BasicRenderComponent"
import { Controls } from "../Controls"
import { CutsceneManager } from "../cutscenes/CutsceneManager"
import { TILE_SIZE } from "../graphics/Tilesets"
import { QuestGame } from "../quest_game"
import { saveManager } from "../SaveManager"
import { Settings } from "../Settings"
import { ButtonsMenu } from "./ButtonsMenu"
import { Color } from "./Color"
import { makeControlsUI } from "./ControlsUI"
import { UIStateManager } from "./UIStateManager"

export class PauseMenu extends Component {
    private readonly e: Entity = new Entity([this]) // entity for this component
    private displayEntity: Entity
    private controlsDisplay: Entity
    private isShiftDown: boolean
    isOpen = false

    update(updateData: UpdateData) {
        const pressEsc = updateData.input.isKeyDown(Controls.closeButton)
        this.isShiftDown = updateData.input.isKeyHeld(Controls.pcModifierKey)

        if ((pressEsc && this.isOpen) || CutsceneManager.instance.isMidCutscene) {
            this.close()
        } else if (pressEsc && !UIStateManager.instance.isMenuOpen) {
            this.open(updateData.dimensions)
        }
    }

    close() {
        this.isOpen = false
        this.displayEntity = null
        this.controlsDisplay = null
    }

    open(dimensions: Point) {
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
                    this.open(dimensions) // refresh
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
                    this.open(dimensions) // refresh
                },
            },
            {
                text: `AMBIENCE (${Settings.getAmbienceVolume() * 100}%)`,
                fn: () => {
                    if (this.isShiftDown) {
                        Settings.decreaseAmbienceVolume()
                    } else {
                        Settings.increaseAmbienceVolume()
                    }
                    this.open(dimensions) // refresh
                },
            },
            {
                text: `MAIN MENU`,
                fn: () => QuestGame.instance.loadMainMenu(),
            },
        ]

        this.isOpen = true

        const buttonColor = "red"
        const textColor = Color.PINK
        const hoverColor = Color.WHITE

        this.displayEntity = ButtonsMenu.render(
            dimensions,
            "red",
            buttons.map((obj) => ({
                ...obj,
                buttonColor,
                textColor,
                hoverColor,
            })),
            new Point(0, 20)
        )

        this.controlsDisplay = new Entity([
            new BasicRenderComponent(...makeControlsUI(dimensions, new Point(0, -TILE_SIZE / 2))),
        ])
    }

    getEntities(): Entity[] {
        return [this.e, this.displayEntity, this.controlsDisplay]
    }
}
