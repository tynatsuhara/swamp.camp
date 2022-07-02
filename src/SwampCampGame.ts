import { Game, UpdateViewsContext } from "brigsby/dist"
import { View } from "brigsby/dist/View"
import { GameScene } from "./scenes/GameScene"
import { MainMenuScene } from "./scenes/MainMenuScene"

export const ZOOM = 3
export const IS_NATIVE_APP = !!new URL(window.location.href).searchParams.get("native_app")

const enum Scene {
    MAIN_MENU,
    GAME,
}

export class SwampCampGame extends Game {
    private static _instance: SwampCampGame
    static get instance() {
        return this._instance
    }

    private scene = Scene.MAIN_MENU
    readonly game = new GameScene()
    readonly mainMenu = new MainMenuScene()

    constructor() {
        super()
        SwampCampGame._instance = this
    }

    initialize() {
        this.game.initialize()
        this.loadMainMenu()
    }

    loadGameScene() {
        this.scene = Scene.GAME
    }

    loadMainMenu() {
        this.scene = Scene.MAIN_MENU
        this.mainMenu.reset()
    }

    // entities in the world space
    getViews(updateViewsContext: UpdateViewsContext): View[] {
        switch (this.scene) {
            case Scene.MAIN_MENU:
                return this.mainMenu.getViews(updateViewsContext)
            case Scene.GAME:
                return this.game.getViews(updateViewsContext)
        }
    }
}
