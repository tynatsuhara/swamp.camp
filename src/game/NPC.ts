import { Component } from "../engine/component"
import { UpdateData, StartData } from "../engine/engine"
import { Dude } from "./Dude"
import { Player } from "./Player"
import { Point } from "../engine/point"

export class NPC extends Component {

    private dude: Dude

    start(startData: StartData) {
        this.dude = this.entity.getComponent(Dude)
        this.dude.speed *= 0.9  // enemies should be slower
    }

    update(updateData: UpdateData) {
        const followDistance = 75
        const buffer = 40  // this basically determines how long they will stop for if they get too close

        const dist = Player.instance.entity.getComponent(Dude).position.minus(this.dude.position)
        const mag = dist.magnitude()

        if (mag > followDistance || ((followDistance-mag) < buffer && Player.instance.entity.getComponent(Dude).isMoving) && this.dude.isMoving) {
            this.dude.move(updateData, dist)
        } else {
            this.dude.move(updateData, new Point(0, 0))
        }
    }
}