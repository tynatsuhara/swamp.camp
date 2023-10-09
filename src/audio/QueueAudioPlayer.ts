import { AudioPlayer } from "./AudioPlayer"
import { AudioUtils } from "./AudioUtils"

const TIME_BETWEEN_FADE_CHECKS = 200

export class QueueAudioPlayer extends AudioPlayer {
    private currentAudio: Howl
    private currentAudioSrc: string

    // the first track is always the current one
    private files: string[]
    private crossFading: Promise<void> // used to track if we're currently crossfading
    private crossFadeVolume: number = 1
    private crossFadeDurationMillis: number
    private timeBetweenTracksMillis: number

    get fileName() {
        return this.currentAudioSrc
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

        setInterval(() => this.checkCrossFadeOut(), TIME_BETWEEN_FADE_CHECKS)
    }

    private checkCrossFadeOut() {
        if (!this.currentAudio || this.crossFading || this.currentAudio.state() === "loading") {
            return
        }
        // start fading out when we're close to the end
        const currentTime = 1000 * this.currentAudio.seek()
        // make sure we fade to 0 before the end of the song
        const fadeStart =
            1000 * this.currentAudio.duration() -
            this.crossFadeDurationMillis -
            TIME_BETWEEN_FADE_CHECKS
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

        // start next track
        this.playFromStart()
    }

    playFromStart() {
        // go to the next track
        this.files.push(this.files.shift())

        const file = this.files[0]
        if (!file) {
            return
        }

        this.log(`started audio: ${this.fileName}`)

        const track = new Howl({
            src: file,
            autoplay: true,
            loop: false,
            html5: true, // for streaming (TODO: can be false for native)
            preload: true,
            volume: 0,
        })

        const start = () => {
            this.currentAudio = track
            this.currentAudioSrc = file
            this.crossFadeIn()
        }

        if (track.state() === "loaded") {
            start()
        } else {
            track.once("load", start)
        }
    }

    stop() {
        this.currentAudio?.stop()
        this.currentAudio = null
        this.currentAudioSrc = null
        this.log("audio stopped")
    }

    updateAudioElementVolume() {
        this.currentAudio?.volume(this.getVolume())
    }

    private setCrossFadeVolume(volume: number) {
        this.crossFadeVolume = volume
        this.updateAudioElementVolume()
    }

    getVolume() {
        return super.getVolume() * this.crossFadeVolume
    }
}
