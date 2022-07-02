import { assets, Engine } from "brigsby/dist"
import { getFilesToLoadForMainMenu } from "./graphics/Tilesets"
import { SwampCampGame } from "./SwampCampGame"
import { TEXT_FONT } from "./ui/Text"

Promise.all([
    // load all required assets
    assets.loadImageFiles(getFilesToLoadForMainMenu()),
    assets.loadFont(TEXT_FONT, "url(/press-start-2p.woff2)"),
]).then(() => {
    // start the engine (vroom vroom)
    Engine.start(new SwampCampGame(), <HTMLCanvasElement>document.getElementById("canvas"))
})
