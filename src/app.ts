import { QuestGame } from "./game/quest_game"
import { Engine } from "./engine/engine"
import { Tilesets } from "./game/graphics/Tilesets"
import { assets } from "./engine/Assets"

assets.loadImageFiles(Tilesets.getFilesToLoad()).then(() => {
    new Engine(new QuestGame(), <HTMLCanvasElement>document.getElementById('canvas'))
})

