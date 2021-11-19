import { debug } from "brigsby/dist/Debug"
import { AudioUtils } from "./AudioUtils"

export abstract class AudioPlayer {
    private readonly queueId: string
    private readonly volumeMultiplier: number

    private volume: number = 1
    private fadeVolume: number = 1

    abstract get fileName(): string

    constructor(queueId: string, volumeMultiplier: number) {
        this.queueId = queueId
        this.volumeMultiplier = volumeMultiplier
    }

    abstract playFromStart()

    abstract stop()

    fadeOut(duration = 1000): Promise<void> {
        if (duration === 0) {
            this.log(`skipping fade for ${this.fileName}`)
            this.setFadeVolume(0)
            return Promise.resolve()
        }
        this.log(`fading out ${this.fileName}`)
        return AudioUtils.adjustVolume(
            this.fadeVolume,
            0,
            (v) => {
                this.setFadeVolume(v)
            },
            duration
        )
    }

    fadeIn(duration = 1000): Promise<void> {
        if (duration === 0) {
            this.log(`skipping fade for ${this.fileName}`)
            this.setFadeVolume(1)
            return Promise.resolve()
        }
        this.log(`fading in ${this.fileName}`)
        return AudioUtils.adjustVolume(
            this.fadeVolume,
            1,
            (v) => {
                this.setFadeVolume(v)
            },
            duration
        )
    }

    setVolume(volume: number) {
        this.volume = volume
        this.updateAudioElementVolume()
    }

    private setFadeVolume(fadeVolume: number) {
        this.fadeVolume = fadeVolume
        this.updateAudioElementVolume()
    }

    abstract updateAudioElementVolume()

    getVolume() {
        return this.fadeVolume * this.volume * this.volumeMultiplier
    }

    log(value: any) {
        if (debug.showAudioLogs) {
            console.log(`[${this.queueId}] ${value}`)
        }
    }
}
