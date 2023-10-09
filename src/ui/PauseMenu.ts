import { Component, debug, Entity, Point, UpdateData } from "brigsby/dist"
import { controls } from "../core/Controls"
import { setGamePaused } from "../core/PauseState"
import { saveManager } from "../core/SaveManager"
import { Settings } from "../core/Settings"
import { Singletons } from "../core/Singletons"
import { SwampCampGame } from "../core/SwampCampGame"
import { Camera } from "../cutscenes/Camera"
import { CutsceneManager } from "../cutscenes/CutsceneManager"
import { TextOverlayManager } from "../cutscenes/TextOverlayManager"
import { session } from "../online/session"
import { hostOnJoin, hostSessionClose } from "../online/syncGame"
import { here } from "../world/locations/LocationManager"
import { ButtonsMenu, OptionButton } from "./ButtonsMenu"
import { Color } from "./Color"
import { ControlsUI } from "./ControlsUI"
import { FullScreenMode } from "./FullScreenMode"
import { NotificationDisplay } from "./NotificationDisplay"
import { cycleTipIndex, TipDisplay } from "./Tips"
import { Tooltip } from "./Tooltip"
import { UIStateManager } from "./UIStateManager"

type PauseOption = Pick<OptionButton, "text" | "fn" | "onMouseOver" | "onMouseOut">

enum Menu {
    ROOT,
    OPTIONS,
}

export class PauseMenu extends Component {
    static get instance() {
        return Singletons.getOrCreate(PauseMenu)
    }

    private readonly e: Entity = new Entity([this]) // entity for this component
    private displayEntity: Entity
    private isShiftDown: boolean
    private menu = Menu.ROOT
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
            cycleTipIndex(1)
            setGamePaused(true)
            this.render(updateData.dimensions)
        } else if (this.isOpen) {
            // refresh
            this.render(updateData.dimensions)
        }
    }

    close(unpause = true) {
        if (unpause) {
            setGamePaused(false)
        }

        this.isOpen = false
        this.displayEntity = null
        this.menu = Menu.ROOT
    }

    private render(dimensions: Point) {
        const tooltip = new Tooltip()

        const buttons: PauseOption[] = []

        if (this.menu === Menu.ROOT) {
            buttons.push(
                debug.disableAutosave &&
                    session.isHost() && {
                        text: "[debug] SAVE GAME",
                        fn: () =>
                            saveManager.save() &&
                            NotificationDisplay.instance.push({
                                icon: "floppy_drive",
                                text: "saved",
                            }),
                    },
                this.getOnlineOption(tooltip),
                {
                    text: "CONTROLS",
                    fn: () => this.showControls(dimensions),
                },
                {
                    text: "OPTIONS",
                    fn: () => {
                        this.menu = Menu.OPTIONS
                    },
                },
                {
                    text: session.isGuest()
                        ? `LEAVE SESSION`
                        : debug.disableAutosave
                        ? `QUIT`
                        : `SAVE & QUIT`,
                    fn: () => {
                        if (session.isHost() && !debug.disableAutosave) {
                            saveManager.save()
                        }
                        requestAnimationFrame(() => {
                            here().toggleAudio(false)
                            SwampCampGame.instance.loadMainMenu()
                        })
                    },
                }
            )
        } else if (this.menu === Menu.OPTIONS) {
            buttons.push(
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
                    text: "BACK",
                    fn: () => {
                        this.menu = Menu.ROOT
                    },
                }
            )
        }

        this.isOpen = true

        const buttonColor = "red"
        const textColor = Color.PINK_3
        const hoverColor = Color.WHITE

        const { entity: displayEntity, dimensions: menuDimensions } = ButtonsMenu.render(
            `pause-${this.menu}`,
            "red",
            buttons
                .filter((btn) => !!btn)
                .map((obj) => ({
                    ...obj,
                    buttonColor,
                    textColor,
                    hoverColor,
                })),
            Camera.instance.dimensions.div(2)
        )

        this.displayEntity = displayEntity

        if (this.menu === Menu.ROOT) {
            this.displayEntity.addComponent(
                new TipDisplay((dimensions.y - menuDimensions.y) / 4 + 8)
            )
        }

        this.displayEntity.addComponent(tooltip)
    }

    private showControls(dimensions: Point) {
        const controlsUI = new ControlsUI(TextOverlayManager.VERTICAL_MARGIN)

        TextOverlayManager.instance.open({
            text: [""],
            finishAction: "COOL",
            additionalComponents: () => [controlsUI],
            pauseBackground: false,
            onFinish: () => this.render(dimensions),
        })

        this.close(false)
    }

    private getFullScreenOption(): PauseOption {
        // this is in an iframe (probably on itch.io), which handles fullscreen itself
        if (window.parent !== window) {
            return
        }

        // native apps use OS fullscreen functionality
        if (window.SWAMP_CAMP.native) {
            return
        }

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
                            navigator.clipboard
                                .writeText(session.getId())
                                .then(() => {
                                    NotificationDisplay.instance.push({
                                        icon: "copy",
                                        text: `copied "${session.getId()}"`,
                                    })
                                })
                                .catch((e) => {
                                    console.warn("cannot access clipboard", e)
                                })
                        })
                        .catch((e) => {
                            console.error("failed to open session", e)
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
