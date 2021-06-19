import { Lists } from "../../engine/util/Lists"
import { TimeUnit } from "../world/TimeUnit"
import { AudioPlayer } from "./AudioPlayer"
import { QueueAudioPlayer } from "./QueueAudioPlayer"
import { WorldAudioContext } from "./WorldAudioContext"

/**
 * Used for background soundtrack and even-based music
 */
export class Music {
    private static readonly VOLUME_MULTIPLER = 0.1
    private static currentMusic: AudioPlayer
    private static volume = 0

    static readonly DAY_MUSIC = Music.queue(
        "daytime jams",
        "hemlok.mp3",
        "01_ice_hearts_frozen_fire.mp3",
        "02_anthem.mp3",
        "03_hymn_overworld.mp3",
        "06_town_settlers_lament.mp3",
        "23_marshlands.mp3",
        "24_grenedier_and_the_lady.mp3",
        "25_farewell_old_friend.mp3",
        "26_town_cliffs_of_dooneen.mp3",
        "37_golems_theme.mp3"
    )

    static readonly NIGHT_MUSIC = Music.queue(
        "nighttime tunes",
        "08_hymn_mysterious_caves.mp3",
        "10_sinister_theme.mp3",
        "12_ambient_evil.mp3",
        "18_laugos_theme.mp3",
        "21_haunted_veranda.mp3",
        "22_flooded_cellars.mp3",
        "35_ambient_evil_2.mp3",
    )

    static readonly BATTLE_MUSIC_LOOPS = Music.queue(
        "battle bops",
        "09_knights_theme.mp3",
        "14_battle_victory.mp3",
        "19_paladins_theme.mp3",
        "27_castle_himmendal.mp3",
        "28_knights_theme_b.mp3",
        "POL-battle-march-short.wav",
    )

    static determineMusic(ctx: WorldAudioContext) {
        // fade out at night
        const timeOfDay = ctx.time % TimeUnit.DAY
        const daytimeFadeInTime = TimeUnit.HOUR * 5
        const daytimeFadeOutTime = TimeUnit.HOUR * 20

        if (timeOfDay > daytimeFadeOutTime || timeOfDay < daytimeFadeInTime) {
            Music.play(Music.NIGHT_MUSIC)
        } else if (timeOfDay > daytimeFadeInTime) {
            Music.play(Music.DAY_MUSIC)
        }

        // TODO: Battle music loops
        // TODO: Main menu music

        window['currentMusic'] = Music.currentMusic
    }

    static play(music: AudioPlayer) {
        if (Music.currentMusic === music) {
            return
        }

        const startNewMusic = () => {
            music.setVolume(Music.getVolume())
            music.playFromStart()
            music.fadeIn()
        }

        if (!!this.currentMusic) {
            const curr = this.currentMusic
            curr.fadeOut().then(() => {
                curr.stop()
                startNewMusic()
            })
        } else {
            startNewMusic()
        }

        this.currentMusic = music
    }

    static setVolume(settingsVolumeLevel: number) {
        Music.volume = settingsVolumeLevel
        Music.currentMusic?.setVolume(Music.getVolume())
    }

    private static getVolume() {
        return Music.volume * Music.VOLUME_MULTIPLER
    }

    private static queue(queueId: string, ...files: string[]) {
        return new QueueAudioPlayer(
            queueId,
            1,
            Lists.shuffled(files.map(f => `audio/music/${f}`)),
            10_000,
            10_000,
        )
    }
}
