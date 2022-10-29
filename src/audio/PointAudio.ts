import { Component, Point, UpdateData } from "brigsby/dist"
import { player } from "../characters/Player"
import { Settings } from "../Settings"

// We store and use a single instance of each unique audio file because having
// multiple of the same audio overlapping can result in a weird robotic effect
const audioElements: {
    [key: string]: {
        audio: HTMLAudioElement
        // The last tick this was updated
        lastUpdate: number
        // Volume to be applied in the next update cycle
        nextVolume: number
    }
} = {}

/**
 * Right now this should only be used for looping audio, since it will only
 * create a single audio element for each audio file
 */
export class PointAudio extends Component {
    private file: string
    position: Point
    distance: number
    multiplier: number
    private active: boolean = true

    get audio() {
        return audioElements[this.file].audio
    }

    constructor(file: string, position: Point, distance: number, multiplier: number = 1) {
        super()
        this.file = file
        this.position = position
        this.distance = distance
        this.multiplier = multiplier
        if (!audioElements[file]) {
            audioElements[file] = {
                audio: new Audio(file),
                lastUpdate: 0,
                nextVolume: 0,
            }
        }
        this.audio.volume = 0 // update() will set volume appropriately
        this.audio.oncanplaythrough = () => {
            this.audio.loop = true
            this.audio.play()
        }
    }

    update({ tick }: UpdateData) {
        if (!this.active) {
            return
        }

        // TODO: Maybe this should be relative to the camera and not the player?
        const distance = player().dude.standingPosition.distanceTo(this.position)

        const audioElement = audioElements[this.file]
        const volumeByDistance =
            Math.max(0, Math.min(1, 1 - distance / this.distance)) *
            Settings.getSoundVolume() *
            this.multiplier

        // As all the PointAudios of the same type are updated, they compute
        // the maximum volume to apply on the next update iteraton
        if (audioElement.lastUpdate !== tick) {
            audioElement.audio.volume = audioElement.nextVolume
            audioElement.nextVolume = volumeByDistance
        } else {
            audioElement.nextVolume = Math.max(volumeByDistance, audioElement.nextVolume)
        }
        audioElement.lastUpdate = tick
    }

    setActive(active: boolean) {
        this.active = active
        if (!active) {
            this.audio.volume = 0
        }
    }

    delete() {
        this.audio.volume = 0
        super.delete()
    }

    setMultiplier(multiplier: number) {
        this.multiplier = multiplier
    }
}
