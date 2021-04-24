import { assets } from "../../engine/Assets"
import { Settings } from "../Settings"

export class Sounds {
    static play(path: string) {
        const audio = assets.getAudioByFileName(path)
        
        if (!audio) {
            console.log(`audio file [${path}] not loaded`)
            return
        }
        
        audio.volume = Settings.getSoundVolume()
        audio.play()
    }
}
