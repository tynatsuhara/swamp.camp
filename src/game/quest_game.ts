import { Game } from "../engine/game"
import { UpdateViewsContext } from "../engine/engine"
import { View } from "../engine/View"
import { saveManager } from "./SaveManager"
import { MainMenuScene } from "./scenes/MainMenuScene"
import { GameScene } from "./scenes/GameScene"

export const enum Scene {
    MAIN_MENU, GAME
}

export class QuestGame extends Game {

    private scene = Scene.MAIN_MENU
    private readonly game = new GameScene()
    private readonly mainMenu = new MainMenuScene(() => this.continueGame(), () => this.startNewGame())

    initialize() {
        this.game.initialize()
    }

    continueGame() {
        this.scene = Scene.GAME
        this.game.continueGame()
    }

    startNewGame() {
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
