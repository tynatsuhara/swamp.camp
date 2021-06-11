import { UpdateViewsContext } from "../engine/Engine"
import { Game } from "../engine/Game"
import { View } from "../engine/View"
import { Music } from "./audio/Music"
import { Save } from "./saves/SaveGame"
import { GameScene } from "./scenes/GameScene"
import { MainMenuScene } from "./scenes/MainMenuScene"

export const enum Scene {
    MAIN_MENU, GAME
}

export class QuestGame extends Game {

    private static _instance: QuestGame
    static get instance() {
        return this._instance
    }

    private scene = Scene.MAIN_MENU
    readonly game = new GameScene()
    readonly mainMenu = new MainMenuScene()

    constructor() {
        super()
        QuestGame._instance = this
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
