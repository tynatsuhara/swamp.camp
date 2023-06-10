import { debug, Game } from "brigsby/dist"
import { Dude } from "../characters/Dude"
import { cleanUpSession } from "../online/syncGame"
import { GameScene } from "../scenes/GameScene"
import { MainMenuScene } from "../scenes/MainMenuScene"

export const ZOOM = debug.photoMode ? 1 : 3

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

        // clean up stuff
        cleanUpSession()
        Dude.clearLookupCache()
    }
}
