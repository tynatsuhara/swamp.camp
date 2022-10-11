import { Component, Point } from "brigsby/dist"
import { Player } from "../characters/Player"
import { Settings } from "../Settings"

// TODO: all active point audio sounds should be registered to prevent redundant
// sounds (eg multiple adjacent waterfalls) from playing at the same time

export class PointAudio extends Component {
    private audio: HTMLAudioElement
    position: Point
    distance: number
    multiplier: number
    private active: boolean = false

    constructor(
        filePath: string,
        position: Point,
        distance: number,
        loop: boolean,
        multiplier: number = 1
    ) {
        super()
        this.position = position
        this.distance = distance
        this.multiplier = multiplier
        this.audio = new Audio(filePath)

        this.start = () => {
            this.audio.oncanplaythrough = () => {
                this.audio.loop = loop
                this.audio.play()
            }
        }
    }

    update() {
        if (!this.active) {
            return
        }
        const distance = Player.instance.dude.standingPosition.distanceTo(this.position)
        this.audio.volume =
            Math.max(0, Math.min(1, 1 - distance / this.distance)) *
            Settings.getSoundVolume() *
            this.multiplier
    }

    setActive(active: boolean) {
        this.active = active
        if (!active) {
            this.audio.volume = 0
        }
    }

    delete() {
        // garbage collect
        this.audio.src = ""
        super.delete()
    }

    setMultiplier(multiplier: number) {
        this.multiplier = multiplier
    }
}
