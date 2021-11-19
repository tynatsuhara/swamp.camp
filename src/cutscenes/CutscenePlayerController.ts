import { Component } from "brigsby/dist/Component"
import { Player } from "../characters/Player"
import { Dude } from "../characters/Dude"
import { UpdateData } from "brigsby/dist/Engine"
import { Point } from "brigsby/dist/Point"

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
        this._dude.move(updateData, this.moveDir)
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
