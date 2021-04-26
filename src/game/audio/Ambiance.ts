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
        this.time = time
        this.determineAmbiance()
    }

    static setIsInterior(isInterior: boolean) {
        this.isInterior = isInterior
        this.determineAmbiance()
    }

    private static determineAmbiance() {
        // TODO: add other ambiance tracks
        this.play(this.DAYTIME)

        // fade out at night
        const fadeTime = TimeUnit.MINUTE * 15
        const timeOfDay = this.time % TimeUnit.DAY
        const daytimeFadeInTime = TimeUnit.HOUR * 5
        const daytimeFadeOutTime = TimeUnit.HOUR * 20
        let fadeMultiplier = 0
        if (timeOfDay > daytimeFadeOutTime) {
            fadeMultiplier = 1 - Math.min(1, (timeOfDay - daytimeFadeOutTime)/fadeTime)
        } else if (timeOfDay > daytimeFadeInTime) {
            fadeMultiplier = Math.min(1, (timeOfDay - daytimeFadeInTime)/fadeTime)
        }

        this.setVolume(fadeMultiplier * (this.isInterior ? .1 : 1))
    }

    private static play(path: string) {
        if (this.currentAmbiance?.src.endsWith(path)) {
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
