import { Lists } from "../../engine/util/Lists"
import { Settings } from "../Settings"
import { TimeUnit } from "../world/TimeUnit"
import { AudioQueue } from "./AudioQueue"

/**
 * Used for long-running background sounds based on environmental factors
 */
export class Ambiance {
    private static currentAmbiance: AudioQueue

    private static readonly DAY = new AudioQueue(["audio/ambiance/daytime.wav"])
    private static readonly NIGHT = new AudioQueue([]) // Lists.range(1, 9).map(i => `audio/ambiance/yewbic__ambience0${i}.wav`))

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
        const volume = Settings.getSoundVolume() * (this.isInterior ? .1 : 1)
        this.DAY.setVolume(volume)
        this.NIGHT.setVolume(volume)

        // fade out at night
        const timeOfDay = this.time % TimeUnit.DAY
        const daytimeFadeInTime = TimeUnit.HOUR * 5
        const daytimeFadeOutTime = TimeUnit.HOUR * 20

        if (timeOfDay > daytimeFadeOutTime || timeOfDay < daytimeFadeInTime) {
            this.play(this.NIGHT)
        } else if (timeOfDay > daytimeFadeInTime) {
            this.play(this.DAY)
        }

        window['currentAmbiance'] = this.currentAmbiance
    }

    private static play(newAmbiance: AudioQueue) {
        if (this.currentAmbiance === newAmbiance) {
            return
        }

        const startNewAmbiance = () => {
            newAmbiance.play()
            newAmbiance.fadeIn()
        }

        if (!!this.currentAmbiance) {
            const curr = this.currentAmbiance
            curr.fadeOut().then(() => {
                curr.pause()
                startNewAmbiance()
            })
        } else {
            startNewAmbiance()
        }

        this.currentAmbiance = newAmbiance
    }
}
