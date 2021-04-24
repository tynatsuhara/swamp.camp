import { QuestGame } from "./game/quest_game"
import { Engine } from "./engine/engine"
import { Tilesets } from "./game/graphics/Tilesets"
import { assets } from "./engine/Assets"
import { Music } from "./game/audio/Music"

Promise.all([
    assets.loadImageFiles(Tilesets.getFilesToLoad()),
    // assets.loadAudioFiles([Music.MAIN_MENU_THEME]),
]).then(() => {
    new Engine(
        new QuestGame(), 
        <HTMLCanvasElement>document.getElementById('canvas')
    )
})

