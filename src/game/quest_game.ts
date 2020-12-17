import { Game } from "../engine/game"
import { UpdateViewsContext } from "../engine/engine"
import { View } from "../engine/View"
import { SaveManager } from "./SaveManager"
import { MainMenuScene } from "./scenes/MainMenuScene"
import { GameScene } from "./scenes/GameScene"

export const enum Scene {
    MAIN_MENU, GAME
}

export class QuestGame extends Game {

    private scene = Scene.MAIN_MENU
    private readonly game = new GameScene()
    private readonly mainMenu = new MainMenuScene()

    initialize() {
        new SaveManager()
        
        this.game.initialize()

        this.continueGame()
    }

    continueGame() {
        console.log("continue game")
        this.scene = Scene.GAME
        SaveManager.instance.load()
    }

    startNewGame() {
        console.log("new game")
        this.scene = Scene.GAME
        this.game.newGame()
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
