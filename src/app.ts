import { assets, Engine } from "brigsby/dist"
import { initializeLogging } from "./debug/logging"
import { getFilesToLoadForMainMenu } from "./graphics/Tilesets"
import { SwampCampGame } from "./SwampCampGame"
import { TEXT_FONT } from "./ui/Text"

declare global {
    interface Window {
        SWAMP_CAMP: {
            version: string
            assets: { [key: string]: string }
        }
    }
}

// focusing adds an ugly outline, so automatically blur
const canvas = <HTMLCanvasElement>document.getElementById("canvas")
canvas.onfocus = () => canvas.blur()

initializeLogging()

Promise.all([
    // load all required assets
    assets.loadImageFiles(getFilesToLoadForMainMenu()),
    assets.loadFont(TEXT_FONT, "url(/fonts/press-start-2p.woff2)"),
]).then(() => {
    // start the engine (vroom vroom)
    Engine.start(new SwampCampGame(), canvas, { fixedHeight: 1000 })
})
