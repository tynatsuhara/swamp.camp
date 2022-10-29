import { Component, Point, UpdateData } from "brigsby/dist"
import { Dude } from "../characters/Dude"
import { player } from "../characters/Player"

export class CutscenePlayerController extends Component {
    static instance: CutscenePlayerController

    private _dude: Dude
    private moveDir: Point = Point.ZERO

    constructor() {
        super()
        CutscenePlayerController.instance = this

        this.enabled = false
    }

    start() {
        this._dude = this.entity.getComponent(Dude)
    }

    update(updateData: UpdateData) {
        this._dude.move(updateData.elapsedTimeMillis, this.moveDir)
    }

    startMoving(moveDir: Point) {
        this.moveDir = moveDir
    }

    stopMoving() {
        this.moveDir = Point.ZERO
    }

    enable() {
        this.enabled = true
        player().enabled = false
        this.stopMoving()
    }

    disable() {
        this.enabled = false
        player().enabled = true
        this.stopMoving()
    }
}
