export class Music {
    private static currentMusic: HTMLAudioElement

    static readonly MAIN_MENU_THEME = "audio/music/hemlok.mp3"

    static play(path: string) {
        this.currentMusic?.pause()

        const newMusic = new Audio(path)

        newMusic.oncanplaythrough = () => {
            newMusic.play()     
            console.log("should be playing!")       
        }

        this.currentMusic = newMusic
    }
}
