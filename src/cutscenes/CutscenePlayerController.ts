import { Component, Point, UpdateData } from "brigsby/lib"
import { Dude } from "../characters/Dude"
import { Player } from "../characters/Player"

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
        Player.instance.enabled = false
        this.stopMoving()
    }

    disable() {
        this.enabled = false
        Player.instance.enabled = true
        this.stopMoving()
    }
}
