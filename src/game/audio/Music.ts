import { Settings } from "../Settings"

/**
 * Used for background soundtrack and even-based music
 */
export class Music {
    private static readonly VOLUME_MULTIPLER = 0.1
    private static currentMusic: HTMLAudioElement
    private static volume: number = Settings.getMusicVolume()

    static readonly MAIN_MENU_THEME = "audio/music/hemlok.mp3"

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
