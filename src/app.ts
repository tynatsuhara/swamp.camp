import { assets, debug, Engine } from "brigsby/dist"
import { initializeLogging } from "./debug/logging"
import { getFilesToLoadForMainMenu } from "./graphics/Tilesets"
import { SwampCampGame } from "./SwampCampGame"
import { TEXT_FONT } from "./ui/Text"

declare global {
    interface Window {
        SWAMP_CAMP: {
            version: string
            assets: { [key: string]: string }
            native: boolean
        }
    }
}

const start = async () => {
    await Promise.all([
        // load all required assets
        assets.loadImageFiles(getFilesToLoadForMainMenu()),
        assets.loadFont(TEXT_FONT, "url(fonts/press-start-2p.woff2)"),
    ])

    initializeLogging()

    const canvas = <HTMLCanvasElement>document.getElementById("canvas")

    Engine.start(new SwampCampGame(), canvas, { fixedHeight: debug.photoMode ? undefined : 900 })
}

start()
