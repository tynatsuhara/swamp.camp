import { Lists } from "brigsby/lib/util"
import { AudioPlayer } from "./AudioPlayer"
import { AudioUtils } from "./AudioUtils"

export class QueueAudioPlayer extends AudioPlayer {
    private currentAudio: HTMLAudioElement

    // the first track is always the current one
    private files: string[]
    private crossFading: Promise<void> // used to track if we're currently crossfading
    private crossFadeVolume: number = 1
    private crossFadeDurationMillis: number
    private timeBetweenTracksMillis: number

    private static readonly TIME_BETWEEN_FADE_CHECKS = 200

    get fileName() {
        return Lists.last(this.currentAudio?.src.split("/"))
    }

    constructor(
        queueId: string,
        volumeMultiplier: number = 1,
        files: string[],
        crossFadeDurationMillis: number = 5000,
        timeBetweenTracksMillis: number = 5000
    ) {
        super(queueId, volumeMultiplier)

        this.files = files
        this.crossFadeDurationMillis = crossFadeDurationMillis
        this.timeBetweenTracksMillis = timeBetweenTracksMillis

        // TODO: nice fade in/out between tracks

        setInterval(() => this.checkCrossFadeOut(), 200)
    }

    private checkCrossFadeOut() {
        if (!this.currentAudio || this.crossFading) {
            return
        }
        // start fading out when we're close to the end
        const currentTime = 1000 * this.currentAudio.currentTime
        // make sure we fade to 0 before the end of the song
        const fadeStart =
            1000 * this.currentAudio.duration -
            this.crossFadeDurationMillis -
            QueueAudioPlayer.TIME_BETWEEN_FADE_CHECKS
        if (currentTime >= fadeStart) {
            this.crossFading = this.crossFadeOut().then(() => {
                this.crossFading = null
                this.playNextSong()
            })
        }
    }

    private crossFadeOut() {
        this.log(`cross fading out ${this.fileName}`)
        return this.doCrossFade(1, 0)
    }

    private crossFadeIn() {
        this.log(`cross fading in ${this.fileName}`)
        return this.doCrossFade(0, 1)
    }

    /**
     * should only be called by crossFadeIn/crossFadeOut
     */
    private doCrossFade(oldVolume: number, newVolume: number): Promise<void> {
        if (!!this.crossFading || !this.currentAudio) {
            this.log(`cannot do cross fade right now: 
    crossFading=${this.crossFading}
    currentAudio=${this.currentAudio}`)
            return Promise.resolve()
        }

        return AudioUtils.adjustVolume(
            oldVolume,
            newVolume,
            (v) => this.setCrossFadeVolume(v),
            this.crossFadeDurationMillis
        ).then(() => {
            // sleep between tracks
            return new Promise((resolve) => {
                setTimeout(() => resolve(), this.timeBetweenTracksMillis)
            })
        })
    }

    private playNextSong() {
        this.log(`finished audio: ${this.fileName}`)

        this.stop()
        this.files.push(this.files.shift())
        // start next track
        this.playFromStart()
    }

    playFromStart() {
        const file = this.files[0]
        if (!file) {
            return
        }

        this.log(`started audio: ${this.fileName}`)

        const track = new Audio(file)

        track.oncanplaythrough = () => {
            this.crossFadeIn()
            track.play()
        }

        this.currentAudio = track
    }

    stop() {
        if (this.currentAudio) {
            this.currentAudio.pause()
            this.currentAudio.src = ""
            this.currentAudio = null
        }
        this.log("audio stopped")
    }

    updateAudioElementVolume() {
        if (!!this.currentAudio) {
            this.currentAudio.volume = this.getVolume()
        }
    }

    private setCrossFadeVolume(volume: number) {
        this.crossFadeVolume = volume
        this.updateAudioElementVolume()
    }

    getVolume() {
        return super.getVolume() * this.crossFadeVolume
    }
}
