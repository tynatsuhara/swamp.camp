import { Lists } from "../../engine/util/Lists"
import { AudioQueue } from "./AudioQueue"

/**
 * Used for background soundtrack and even-based music
 */
export class Music {
    private static readonly VOLUME_MULTIPLER = 0.1
    private static currentMusic: AudioQueue
    private static volume = 0

    static readonly DAY_MUSIC = Music.queue(
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
        "08_hymn_mysterious_caves.mp3",
        "10_sinister_theme.mp3",
        "12_ambient_evil.mp3",
        "18_laugos_theme.mp3",
        "21_haunted_veranda.mp3",
        "22_flooded_cellars.mp3",
        "35_ambient_evil_2.mp3",
    )

    static readonly BATTLE_MUSIC_LOOPS = Music.queue(
        "09_knights_theme.mp3",
        "14_battle_victory.mp3",
        "19_paladins_theme.mp3",
        "27_castle_himmendal.mp3",
        "28_knights_theme_b.mp3",
        "POL-battle-march-short.wav",
    )

    static play(music: AudioQueue) {
        this.currentMusic?.pause()
        this.currentMusic = music
        this.currentMusic.setVolume(this.getVolume())
        this.currentMusic.play()

        window['currentMusic'] = this.currentMusic
    }

    static setVolume(volume: number) {
        this.volume = volume
        this.currentMusic?.setVolume(this.getVolume())
    }

    private static getVolume() {
        return this.volume * this.VOLUME_MULTIPLER
    }

    private static queue(...files: string[]) {
        return new AudioQueue(Lists.shuffled(files.map(f => `audio/music/${f}`)))
    }
}
