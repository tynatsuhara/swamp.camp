import { AudioUtils } from "./AudioUtils"

export class AudioQueue {
    private currentAudio: HTMLAudioElement
    private volume: number = 1
    private fadeVolume: number = 0

    // the first track is always the current one
    private files: string[]
    private multiplier: number

    constructor(
        files: string[], 
        multiplier: number = 1,
    ) {
        this.files = files
        this.multiplier = multiplier
        // TODO: nice fade in/out between tracks
    }

    fadeOut(): Promise<void> {
        console.log(`fading out ${this.currentAudio?.src}`)
        return AudioUtils.adjustVolume(this.fadeVolume, 0, v => {
            this.setFadeVolume(v)
            if (v === 0) {
                console.log(`faded out ${this.currentAudio?.src}`)
            }
        })
    }

    fadeIn(): Promise<void> {
        console.log(`fading in ${this.currentAudio?.src}`)
        return AudioUtils.adjustVolume(this.fadeVolume, 1, v => {
            this.setFadeVolume(v)
            if (v === 1) {
                console.log(`faded in ${this.currentAudio?.src}`)
            }
        })
    }

    play() {
        // currently, will restart the track each time it is called
        const file = this.files[0]
        if (!file) {
            return
        }
        const track = new Audio(file)
        track.oncanplaythrough = () => {
            track.volume = this.getVolume()
            track.play()
        }
        track.onended = () => {
            track.pause()
            this.currentAudio = null
            this.files.push(this.files.shift())
            // start next track
            this.play()
        }

        this.currentAudio = track
    }

    pause() {
        this.currentAudio?.pause()
    }

    playNext() {
        const track = this.files.shift()
        if (!track) {
            return
        }
        this.files.push(track)
        this.play()
    }

    setVolume(volume: number) {
        this.volume = volume
        this.updateVolume()
    }

    private setFadeVolume(fadeVolume: number) {
        this.fadeVolume = fadeVolume
        this.updateVolume()
    }

    private updateVolume() {
        if (!!this.currentAudio) {
            this.currentAudio.volume = this.getVolume()
        }
    }

    private getVolume = () => this.fadeVolume * this.volume * this.multiplier
}