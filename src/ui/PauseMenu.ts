import { Component } from "brigsby/dist/Component"
import { UpdateData } from "brigsby/dist/Engine"
import { Entity } from "brigsby/dist/Entity"
import { controls } from "../Controls"
import { Camera } from "../cutscenes/Camera"
import { CutsceneManager } from "../cutscenes/CutsceneManager"
import { TextOverlayManager } from "../cutscenes/TextOverlayManager"
import { QuestGame } from "../quest_game"
import { saveManager } from "../SaveManager"
import { Settings } from "../Settings"
import { ButtonsMenu } from "./ButtonsMenu"
import { Color } from "./Color"
import { ControlsUI } from "./ControlsUI"
import { FullScreenMode } from "./FullScreenMode"
import { UIStateManager } from "./UIStateManager"

type PauseOption = {
    text: string
    fn: () => void
}

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
            this.open()
        } else if (this.isOpen) {
            this.refresh()
        }
    }

    close() {
        this.isOpen = false
        this.displayEntity = null
    }

    private refresh() {
        this.open()
    }

    open() {
        const buttons: PauseOption[] = [
            {
                text: "SAVE GAME",
                fn: () => saveManager.save(),
            },
            {
                text: "LOAD LAST SAVE",
                fn: () => saveManager.load(),
            },
            {
                text: "VIEW CONTROLS",
                fn: () => this.showControls(),
            },
            {
                text: `MUSIC (${Settings.getMusicVolume() * 100}%)`,
                fn: () => {
                    if (this.isShiftDown) {
                        Settings.decreaseMusicVolume()
                    } else {
                        Settings.increaseMusicVolume()
                    }
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
                },
            },
            this.getFullScreenOption(),
            {
                text: `MAIN MENU`,
                fn: () => QuestGame.instance.loadMainMenu(),
            },
        ]

        this.isOpen = true

        const buttonColor = "red"
        const textColor = Color.PINK_3
        const hoverColor = Color.WHITE

        this.displayEntity = ButtonsMenu.render(
            "red",
            buttons.map((obj) => ({
                ...obj,
                buttonColor,
                textColor,
                hoverColor,
            })),
            Camera.instance.dimensions.div(2)
        )
    }

    private showControls() {
        const controlsUI = new ControlsUI(TextOverlayManager.VERTICAL_MARGIN)

        TextOverlayManager.instance.open({
            text: [""],
            finishAction: "COOL",
            additionalComponents: () => [controlsUI],
        })
    }

    private getFullScreenOption(): PauseOption {
        if (FullScreenMode.isFullScreen()) {
            return {
                text: `FULL-SCREEN: ON`,
                fn: FullScreenMode.exit,
            }
        } else {
            return {
                text: `FULL-SCREEN: OFF`,
                fn: FullScreenMode.enter,
            }
        }
    }

    getEntities(): Entity[] {
        return [this.e, this.displayEntity]
    }
}
