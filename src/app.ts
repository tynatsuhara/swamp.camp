import { assets } from "brigsby/dist/Assets"
import { Engine } from "brigsby/dist/Engine"
import { getFilesToLoadForMainMenu } from "./graphics/Tilesets"
import { SwampCampGame } from "./SwampCampGame"
import { TEXT_FONT } from "./ui/Text"

Promise.all([
    // load all required assets
    assets.loadImageFiles(getFilesToLoadForMainMenu()),
    assets.loadFont(
        TEXT_FONT,
        "url(https://fonts.gstatic.com/s/pressstart2p/v9/e3t4euO8T-267oIAQAu6jDQyK3nVivM.woff2)"
    ),
]).then(() => {
    // start the engine (vroom vroom)
    Engine.start(new SwampCampGame(), <HTMLCanvasElement>document.getElementById("canvas"))
})
