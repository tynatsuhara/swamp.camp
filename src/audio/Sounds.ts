import { assets } from "brigsby/dist/Assets"
import { Settings } from "../Settings"

/**
 * Used for general purpose one-off sound effects
 */
export class Sounds {
    /**
     * @returns a promise that will resolve when the sound starts playing
     */
    static play(path: string, volume: number = 1): Promise<void> {
        const audio = assets.getAudioByFileName(path)

        if (!audio) {
            console.log(`audio file [${path}] not loaded`)
            return
        }

        audio.volume = Math.min(1, Settings.getSoundVolume() * volume)

        return new Promise((resolve) => {
            audio.oncanplay = () => {
                audio.play()
                resolve()
            }
        })
    }
}
