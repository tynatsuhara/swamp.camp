import { QuestGame } from "./game/quest_game"
import { Engine } from "./engine/Engine"
import { Tilesets } from "./game/graphics/Tilesets"
import { assets } from "./engine/Assets"
import { TEXT_FONT } from "./game/ui/Text"

Promise.all([
    // load all required assets
    assets.loadImageFiles(Tilesets.getFilesToLoad()),
    assets.loadFont(TEXT_FONT, "url(https://fonts.gstatic.com/s/pressstart2p/v9/e3t4euO8T-267oIAQAu6jDQyK3nVivM.woff2)"),
]).then(() => {
    // start the engine (vroom vroom)
    new Engine(
        new QuestGame(), 
        <HTMLCanvasElement>document.getElementById('canvas')
    )
})
