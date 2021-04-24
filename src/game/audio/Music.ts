import { Settings } from "../Settings"

export class Music {
    private static currentMusic: HTMLAudioElement
    private static volume: number = Settings.getMusicVolume()

    static readonly MAIN_MENU_THEME = "audio/music/hemlok.mp3"

    static play(path: string) {
        this.currentMusic?.pause()

        const newMusic = new Audio(path)
        newMusic.volume = this.volume

        newMusic.oncanplaythrough = () => {
            newMusic.play()
        }

        this.currentMusic = newMusic
    }

    static setVolume(volume: number) {
        console.log("volume: " + volume)
        this.volume = volume
        if (!!this.currentMusic) {
            this.currentMusic.volume = volume
        }
    }
}
