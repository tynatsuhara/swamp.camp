import { Component } from "brigsby/dist/Component"
import { UpdateData } from "brigsby/dist/Engine"
import { Entity } from "brigsby/dist/Entity"
import { Point } from "brigsby/dist/Point"
import { controls } from "../Controls"
import { CutsceneManager } from "../cutscenes/CutsceneManager"
import { QuestGame } from "../quest_game"
import { saveManager } from "../SaveManager"
import { Settings } from "../Settings"
import { ButtonsMenu } from "./ButtonsMenu"
import { Color } from "./Color"
import { UIStateManager } from "./UIStateManager"

export class PauseMenu extends Component {
    private readonly e: Entity = new Entity([this]) // entity for this component
    private displayEntity: Entity
    private isShiftDown: boolean
    isOpen = false

    update(updateData: UpdateData) {
        const pressPauseButton = controls.isOpenPauseMenuButtonDown()
        this.isShiftDown = controls.isModifierHeld()

        if (
            ((pressPauseButton || controls.isCloseMenuButtonDown()) && this.isOpen) ||
            CutsceneManager.instance.isMidCutscene
        ) {
            this.close()
        } else if (pressPauseButton && !UIStateManager.instance.isMenuOpen) {
            this.open(updateData.dimensions)
        }
    }

    close() {
        this.isOpen = false
        this.displayEntity = null
    }

    // TODO: Stop passing dimensions param
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
            }))
        )
    }

    getEntities(): Entity[] {
        return [this.e, this.displayEntity]
    }
}
