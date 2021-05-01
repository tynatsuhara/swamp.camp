import { Component } from "../../engine/Component"
import { Point } from "../../engine/Point"
import { Player } from "../characters/Player"
import { Settings } from "../Settings"

export class PointAudio extends Component {

    private readonly audio: HTMLAudioElement
    private readonly pos: Point
    private readonly distance: number
    private multiplier: number = 1
    private active: boolean = true

    constructor(filePath: string, pos: Point, distance: number, loop: boolean) {
        super()

        this.audio = new Audio(filePath)
        this.audio.oncanplaythrough = () => {
            this.audio.loop = loop
            this.audio.play()
        }

        this.pos = pos
        this.distance = distance
    }

    update() {
        if (!this.active) {
            return
        }
        const distance = Player.instance.dude.standingPosition.distanceTo(this.pos)
        this.audio.volume = Math.max(0, Math.min(1, 1-distance/this.distance)) * Settings.getSoundVolume() * this.multiplier
    }

    setActive(active: boolean) {
        this.active = active
        if (!active) {
            this.audio.volume = 0
        }
    }

    setMultiplier(multiplier: number) {
        this.multiplier = multiplier
    }
}