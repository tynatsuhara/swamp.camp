import { Component, Point } from "brigsby/dist"
import { Player } from "../characters/Player"
import { Settings } from "../Settings"

export class PointAudio extends Component {
    private readonly audio: HTMLAudioElement
    position: Point
    distance: number
    multiplier: number
    private active: boolean = true

    constructor(
        filePath: string,
        position: Point,
        distance: number,
        loop: boolean,
        multiplier: number = 1
    ) {
        super()

        this.audio = new Audio(filePath)
        this.audio.oncanplaythrough = () => {
            this.audio.loop = loop
            this.audio.play()
        }

        this.position = position
        this.distance = distance
        this.multiplier = multiplier
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
