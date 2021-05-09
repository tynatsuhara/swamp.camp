import { Lists } from "../../engine/util/Lists"
import { Player } from "../characters/Player"
import { Settings } from "../Settings"
import { OutdoorDarknessMask } from "../world/OutdoorDarknessMask"
import { TimeUnit } from "../world/TimeUnit"
import { AudioQueue } from "./AudioQueue"
import { WorldAudioContext } from "./WorldAudioContext"

/**
 * Used for long-running background sounds based on environmental factors
 */
export class Ambiance {
    private static currentAmbiance: AudioQueue

    private static readonly DAY = new AudioQueue(["audio/ambiance/daytime.wav"])
    private static readonly NIGHT = new AudioQueue(
        Lists.shuffled(Lists.range(1, 9).map(i => `audio/ambiance/yewbic__ambience0${i}.wav`)),
        .025
    )

    static determineAmbiance(ctx: WorldAudioContext) {
        const volume = Settings.getSoundVolume() * (ctx.isInterior ? .1 : 1)
        Ambiance.DAY.setVolume(volume)

        const inDarkness = OutdoorDarknessMask.instance.isDark(Player.instance.dude.standingPosition)
        Ambiance.NIGHT.setVolume(volume * (inDarkness ? 1 : .5))

        // fade out at night
        const timeOfDay = ctx.time % TimeUnit.DAY
        const daytimeFadeInTime = TimeUnit.HOUR * 5
        const daytimeFadeOutTime = TimeUnit.HOUR * 20

        if (timeOfDay > daytimeFadeOutTime || timeOfDay < daytimeFadeInTime) {
            Ambiance.play(Ambiance.NIGHT)
        } else if (timeOfDay > daytimeFadeInTime) {
            Ambiance.play(Ambiance.DAY)
        }

        window['currentAmbiance'] = Ambiance.currentAmbiance
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
