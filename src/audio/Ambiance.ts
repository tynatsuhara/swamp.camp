import { Lists } from "brigsby/dist/util"
import { Player } from "../characters/Player"
import { Settings } from "../Settings"
import { DarknessMask } from "../world/DarknessMask"
import { LightManager } from "../world/LightManager"
import { TimeUnit } from "../world/TimeUnit"
import { AudioPlayer } from "./AudioPlayer"
import { QueueAudioPlayer } from "./QueueAudioPlayer"
import { WorldAudioContext } from "./WorldAudioContext"

/**
 * Used for long-running background sounds based on environmental factors
 */
export class Ambiance {
    private static currentAmbiance: AudioPlayer

    private static readonly DAY = new QueueAudioPlayer(
        "chirpy daytime ambiance",
        0.75,
        ["audio/ambiance/daytime.ogg"],
        0, // don't crossfade
        0 // no time between end/start
    )
    private static readonly NIGHT = new QueueAudioPlayer(
        "spoopy nighttime ambiance",
        0.025,
        Lists.shuffled(Lists.range(1, 9).map((i) => `audio/ambiance/yewbic__ambience0${i}.wav`)),
        0, // don't crossfade
        30_000
    )

    static determineAmbiance(ctx: WorldAudioContext) {
        // Ambiance volume is closely tied to the world context so we don't update
        // the volume from the settings until determineAmbiance is called

        const volume = Settings.getAmbienceVolume() * (ctx.isInterior ? 0.1 : 1)
        Ambiance.DAY.setVolume(volume)

        const inDarkness = LightManager.instance.isDark(Player.instance.dude.standingPosition)
        Ambiance.NIGHT.setVolume(volume * (inDarkness ? 1 : 0.5))

        // fade out at night
        const timeOfDay = ctx.time % TimeUnit.DAY
        const daytimeFadeInTime = DarknessMask.SUNRISE_START
        const daytimeFadeOutTime = DarknessMask.SUNSET_END

        if (timeOfDay > daytimeFadeOutTime || timeOfDay < daytimeFadeInTime) {
            Ambiance.play(Ambiance.NIGHT)
        } else if (timeOfDay > daytimeFadeInTime) {
            Ambiance.play(Ambiance.DAY)
        }

        window["currentAmbiance"] = Ambiance.currentAmbiance
    }

    private static play(newAmbiance: AudioPlayer) {
        if (this.currentAmbiance === newAmbiance) {
            return
        }

        const startNewAmbiance = () => {
            newAmbiance.playFromStart()
            newAmbiance.fadeIn()
        }

        if (!!this.currentAmbiance) {
            const curr = this.currentAmbiance
            curr.fadeOut().then(() => {
                curr.stop()
                startNewAmbiance()
            })
        } else {
            startNewAmbiance()
        }

        this.currentAmbiance = newAmbiance
    }

    static stop() {
        const current = Ambiance.currentAmbiance
        Ambiance.currentAmbiance = null
        current?.fadeOut().then(() => {
            current.stop()
        })
    }
}
