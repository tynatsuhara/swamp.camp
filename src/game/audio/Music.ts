import { Lists } from "../../engine/util/Lists"

/**
 * Used for background soundtrack and even-based music
 */
export class Music {
    private static readonly VOLUME_MULTIPLER = 0.05
    private static currentMusic: HTMLAudioElement
    private static volume = 0

    static readonly DAY_MUSIC = Lists.shuffle([
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
    ])

    static readonly NIGHT_MUSIC = Lists.shuffle([
        "08_hymn_mysterious_caves.mp3",
        "10_sinister_theme.mp3",
        "12_ambient_evil.mp3",
        "18_laugos_theme.mp3",
        "21_haunted_veranda.mp3",
        "22_flooded_cellars.mp3",
        "35_ambient_evil_2.mp3",
    ])

    static readonly BATTLE_MUSIC_LOOPS = Lists.shuffle([
        "09_knights_theme.mp3",
        "14_battle_victory.mp3",
        "19_paladins_theme.mp3",
        "27_castle_himmendal.mp3",
        "28_knights_theme_b.mp3",
        "POL-battle-march-short.wav",
    ])

    static play(path: string) {
        this.currentMusic?.pause()

        const newMusic = new Audio(path)
        newMusic.volume = this.volume * this.VOLUME_MULTIPLER

        newMusic.oncanplaythrough = () => {
            newMusic.play()
        }

        this.currentMusic = newMusic
    }

    static setVolume(volume: number) {
        this.volume = volume
        if (!!this.currentMusic) {
            this.currentMusic.volume = volume * this.VOLUME_MULTIPLER
        }
    }
}
