import { Lists } from "brigsby/dist/util/Lists"
import { DarknessMask } from "../world/DarknessMask"
import { TimeUnit } from "../world/TimeUnit"
import { AudioPlayer } from "./AudioPlayer"
import { LoopingAudioPlayer } from "./LoopingAudioPlayer"
import { QueueAudioPlayer } from "./QueueAudioPlayer"
import { WorldAudioContext } from "./WorldAudioContext"

/**
 * Used for background soundtrack and even-based music
 */
export class Music {
    private static readonly VOLUME_MULTIPLER = 0.05
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
        "35_ambient_evil_2.mp3"
    )

    static readonly BATTLE_MUSIC_LOOPS: AudioPlayer[] = [
        new LoopingAudioPlayer("battle bop 1", 1, "audio/music/09_knights_theme.mp3"),
        new LoopingAudioPlayer("battle bop 2", 1, "audio/music/14_battle_victory.mp3"),
        new LoopingAudioPlayer("battle bop 3", 1, "audio/music/19_paladins_theme.mp3"),
        new LoopingAudioPlayer("battle bop 4", 1, "audio/music/27_castle_himmendal.mp3"),
        new LoopingAudioPlayer("battle bop 5", 1, "audio/music/28_knights_theme_b.mp3"),
        new LoopingAudioPlayer("battle bop 6", 1, "audio/music/POL-battle-march-short.wav"),
    ]

    static currentBattleMusic: LoopingAudioPlayer

    static determineMusic(ctx: WorldAudioContext) {
        // fade out at night
        const timeOfDay = ctx.time % TimeUnit.DAY
        const daytimeFadeInTime = DarknessMask.SUNRISE_START
        const daytimeFadeOutTime = DarknessMask.SUNSET_END

        let music: AudioPlayer

        if (ctx.isInBattle) {
            // only play if we don't already have a battle loop going
            if (!Music.BATTLE_MUSIC_LOOPS.includes(Music.currentMusic)) {
                music = Lists.oneOf(Music.BATTLE_MUSIC_LOOPS)
            }
        } else if (timeOfDay > daytimeFadeOutTime || timeOfDay < daytimeFadeInTime) {
            music = Music.NIGHT_MUSIC
        } else if (timeOfDay > daytimeFadeInTime) {
            music = Music.DAY_MUSIC
        }

        if (music) {
            Music.play(music)
        }
    }

    /**
     * currentMusic will always be updated after calling
     */
    private static play(music: AudioPlayer) {
        if (Music.currentMusic === music) {
            return
        }

        const startNewMusic = () => {
            music.setVolume(Music.getVolume())
            music.playFromStart()
            music.fadeIn()
        }

        if (!!Music.currentMusic) {
            const curr = Music.currentMusic
            curr.fadeOut().then(() => {
                curr.stop()
                startNewMusic()
            })
        } else {
            startNewMusic()
        }

        Music.currentMusic = music
        console.log(`set currentMusic to ${Music.currentMusic.fileName}`)
    }

    static stop() {
        const current = Music.currentMusic
        Music.currentMusic = null
        current?.fadeOut().then(() => {
            current.stop()
        })
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
            Lists.shuffled(files.map((f) => `audio/music/${f}`)),
            10_000,
            10_000
        )
    }
}
