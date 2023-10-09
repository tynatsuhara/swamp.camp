import { AudioPlayer } from "./AudioPlayer"

export class LoopingAudioPlayer extends AudioPlayer {
    readonly fileName: string
    private howl: Howl

    constructor(queueId: string, volumeMultiplier: number, fileName: string) {
        super(queueId, volumeMultiplier)
        this.fileName = fileName
        this.howl = new Howl({ src: fileName, autoplay: false, loop: true, html5: true })
    }

    playFromStart() {
        this.stop()

        this.howl.play()
    }

    stop() {
        this.howl?.stop()
    }

    updateAudioElementVolume() {
        this.howl.volume(this.getVolume())
    }
}
