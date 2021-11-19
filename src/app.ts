import { QuestGame } from "./quest_game"
import { Engine } from "brigsby/dist/Engine"
import { Tilesets } from "./graphics/Tilesets"
import { assets } from "brigsby/dist/Assets"
import { TEXT_FONT } from "./ui/Text"

Promise.all([
    // load all required assets
    assets.loadImageFiles(Tilesets.getFilesToLoad()),
    assets.loadFont(
        TEXT_FONT,
        "url(https://fonts.gstatic.com/s/pressstart2p/v9/e3t4euO8T-267oIAQAu6jDQyK3nVivM.woff2)"
    ),
]).then(() => {
    // start the engine (vroom vroom)
    Engine.start(new QuestGame(), <HTMLCanvasElement>document.getElementById("canvas"))
})
