import { Component, Entity, UpdateData } from "brigsby/dist"
import { controls } from "../Controls"
import { Camera } from "../cutscenes/Camera"
import { CutsceneManager } from "../cutscenes/CutsceneManager"
import { TextOverlayManager } from "../cutscenes/TextOverlayManager"
import { session } from "../online/session"
import { hostOnJoin, hostSessionClose } from "../online/syncGame"
import { saveManager } from "../SaveManager"
import { Settings } from "../Settings"
import { SwampCampGame } from "../SwampCampGame"
import { here } from "../world/locations/LocationManager"
import { ButtonsMenu, OptionButton } from "./ButtonsMenu"
import { Color } from "./Color"
import { ControlsUI } from "./ControlsUI"
import { FullScreenMode } from "./FullScreenMode"
import { NotificationDisplay } from "./NotificationDisplay"
import { Tooltip } from "./Tooltip"
import { UIStateManager } from "./UIStateManager"

type PauseOption = Pick<OptionButton, "text" | "fn" | "onMouseOver" | "onMouseOut">

export class PauseMenu extends Component {
    private readonly e: Entity = new Entity([this]) // entity for this component
    private displayEntity: Entity
    private isShiftDown: boolean
    isOpen = false

    update(updateData: UpdateData) {
        const pressPauseButton = controls.isOpenPauseMenuButtonDown()
        this.isShiftDown = controls.isAudioDecreaseModifierHeld()

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
        const tooltip = new Tooltip()

        const buttons: PauseOption[] = [
            // TODO figure out how to handle saving with multiplayer
            session.isHost() && {
                text: "SAVE GAME",
                fn: () => saveManager.save(),
            },
            // {
            //     text: "LOAD LAST SAVE",
            //     fn: () => saveManager.load(),
            // },
            this.getOnlineOption(tooltip),
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
                text: session.isGuest() ? `LEAVE SESSION` : `MAIN MENU`,
                fn: () => {
                    here().toggleAudio(false)
                    SwampCampGame.instance.loadMainMenu()
                },
            },
        ].filter((btn) => !!btn)

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

        this.displayEntity.addComponent(tooltip)
    }

    private showControls() {
        const controlsUI = new ControlsUI(TextOverlayManager.VERTICAL_MARGIN)

        TextOverlayManager.instance.open({
            text: [""],
            finishAction: "COOL",
            additionalComponents: () => [controlsUI],
            pauseBackground: false,
        })

        this.close()
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

    private getOnlineOption(tooltip: Tooltip): PauseOption | undefined {
        if (session.isOnline()) {
            if (session.isHost()) {
                return {
                    text: `END SESSION @${session.getId()}`,
                    fn: () => {
                        if (session.isGuest()) {
                            SwampCampGame.instance.loadMainMenu()
                        } else {
                            hostSessionClose()
                        }
                    },
                }
            }
        } else {
            return {
                text: "MULTIPLAYER",
                fn: () => {
                    session
                        .open(() => hostOnJoin())
                        .then(() => {
                            navigator.clipboard.writeText(session.getId()).then(() => {
                                NotificationDisplay.instance.push({
                                    icon: "copy",
                                    text: `copied "${session.getId()}"`,
                                })
                            })
                        })
                },
                onMouseOver: () => tooltip.say("VERY experimental!"),
                onMouseOut: () => tooltip.clear(),
            }
        }
    }

    getEntities(): Entity[] {
        return [this.e, this.displayEntity]
    }
}
