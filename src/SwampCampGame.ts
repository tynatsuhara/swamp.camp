import { Game } from "brigsby/dist"
import { cleanUpSession as cleanUpExistingSession } from "./online/syncGame"
import { GameScene } from "./scenes/GameScene"
import { MainMenuScene } from "./scenes/MainMenuScene"

export const ZOOM = 3
export const IS_NATIVE_APP = !!new URL(window.location.href).searchParams.get("native_app")

export class SwampCampGame extends Game {
    private static _instance: SwampCampGame
    static get instance() {
        return this._instance
    }

    readonly gameScene = new GameScene()
    readonly mainMenuScene = new MainMenuScene()

    constructor() {
        super()
        SwampCampGame._instance = this
    }

    initialize() {
        this.gameScene.initialize()
        this.loadMainMenu()
    }

    loadGameScene() {
        this.scene = this.gameScene
    }

    loadMainMenu() {
        this.scene = this.mainMenuScene
        this.mainMenuScene.reset()
        cleanUpExistingSession()
    }
}
