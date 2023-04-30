import { assets, debug, Engine } from "brigsby/dist"
import { initializeLogging } from "./debug/logging"
import { getFilesToLoadForMainMenu } from "./graphics/Tilesets"
import { SwampCampGame } from "./SwampCampGame"
import { TEXT_FONT } from "./ui/Text"

// This is how many "pixels" tall the game will be, unrelated to the screen's actual resolution
const DEFAULT_FIXED_HEIGHT = 850

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

    const fixedHeight = (() => {
        if (debug.photoMode) return undefined
        if (debug.fixedHeight) return debug.fixedHeight
        const screenHeight = window.screen.availHeight
        // We don't want to scale down small or low-resolution screens. Instead, stuff gets squished a bit.
        if (screenHeight < DEFAULT_FIXED_HEIGHT) {
            return screenHeight
        }
        return DEFAULT_FIXED_HEIGHT
    })()

    Engine.start(new SwampCampGame(), canvas, { fixedHeight })
}

start()
