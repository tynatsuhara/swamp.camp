import { AudioPlayer } from "./AudioPlayer";

export class LoopingAudioPlayer extends AudioPlayer {

    readonly fileName: string
    private track: HTMLAudioElement

    constructor(queueId: string, volumeMultiplier: number, fileName: string) {
        super(queueId, volumeMultiplier)
        this.fileName = fileName
    }

    playFromStart() {
        this.stop()

        this.track = new Audio(this.fileName)
        this.track.loop = true
        this.track.oncanplaythrough = () => {
            this.track.play()
        }
    }

    stop() {
        this.track?.pause()
    }

    updateAudioElementVolume() {
        if (this.track) {
            this.track.volume = this.getVolume()
        }
    }
}