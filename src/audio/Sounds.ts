import { assets } from "brigsby/dist/Assets"
import { Settings } from "../Settings"

/**
 * Used for general purpose one-off sound effects
 */
export class Sounds {

    static play(path: string, volume: number = 1) {
        const audio = assets.getAudioByFileName(path)
        
        if (!audio) {
            console.log(`audio file [${path}] not loaded`)
            return
        }
        
        audio.volume = Settings.getSoundVolume() * volume
        audio.play()
    }
}
