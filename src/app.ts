import { QuestGame } from "./game/quest_game"
import { Engine } from "./engine/engine"
import { TileManager } from "./game/graphics/TileManager"
import { assets } from "./engine/Assets"

assets.loadImageFiles(TileManager.getFilesToLoad()).then(() => {
    new Engine(new QuestGame(), <HTMLCanvasElement>document.getElementById('canvas'))
})

