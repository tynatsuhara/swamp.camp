import { QuestGame } from "./game/quest_game"
import { Engine } from "./engine/Engine"
import { Tilesets } from "./game/graphics/Tilesets"
import { assets } from "./engine/Assets"

Promise.all([
    // load all required assets
    assets.loadImageFiles(Tilesets.getFilesToLoad()),
]).then(() => {
    // start the engine (vroom vroom)
    new Engine(
        new QuestGame(), 
        <HTMLCanvasElement>document.getElementById('canvas')
    )
})
