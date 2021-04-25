import { assets } from "../../engine/Assets"
import { Settings } from "../Settings"
import { TimeUnit } from "../world/TimeUnit"
import { WorldTime } from "../world/WorldTime"

/**
 * Used for long-running background sounds based on environmental factors
 */
export class Ambiance {
    private static currentAmbiance: HTMLAudioElement

    private static readonly DAYTIME = "audio/ambiance/daytime.wav"

    private static time: number
    private static isInterior: boolean

    static setTime(time: number) {
        const timeOfDay = time % TimeUnit.DAY
    }

    static setIsInterior(isInterior: boolean) {
        this.play(this.DAYTIME)
        this.setVolume(isInterior ? .1 : 1)
    }

    /**
     * @param path the audio file to load
     * @param volume 
     * @returns 
     */
    private static play(path: string) {
        if (this.currentAmbiance?.src.endsWith(path)) {
            console.log("don't restart")
            return
        }

        this.currentAmbiance?.pause()

        const newAmbiance = new Audio(path)

        newAmbiance.oncanplaythrough = () => {
            newAmbiance.loop = true
            newAmbiance.play()
        }

        this.currentAmbiance = newAmbiance
    }

    private static setVolume(volume: number) {
        if (!!this.currentAmbiance) {
            this.currentAmbiance.volume = volume * Settings.getSoundVolume()
        }
    }
}
