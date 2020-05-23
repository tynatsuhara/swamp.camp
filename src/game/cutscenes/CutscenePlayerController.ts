import { Component } from "../../engine/component"
import { Player } from "../characters/Player"
import { Dude } from "../characters/Dude"
import { StartData, UpdateData } from "../../engine/engine"
import { Point } from "../../engine/point"

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
    }

    disable() {
        this.enabled = false
        Player.instance.enabled = true
    }
}