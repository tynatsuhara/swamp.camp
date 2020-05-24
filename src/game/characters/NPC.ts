import { Component } from "../../engine/component"
import { UpdateData, StartData } from "../../engine/engine"
import { Dude } from "./Dude"
import { Player } from "./Player"
import { Point } from "../../engine/point"

export class NPC extends Component {

    private dude: Dude

    start(startData: StartData) {
        this.dude = this.entity.getComponent(Dude)
    }

    update(updateData: UpdateData) {
        // TODO: reenable once we have a use case for following
        // this.follow(updateData)
    }

    private follow(updateData) {
        const followDistance = 75
        const buffer = 40  // this basically determines how long they will stop for if they get too close

        const dist = Player.instance.dude.position.minus(this.dude.position)
        const mag = dist.magnitude()

        if (mag > followDistance || ((followDistance-mag) < buffer && Player.instance.dude.isMoving) && this.dude.isMoving) {
            this.dude.move(updateData, dist)
        } else {
            this.dude.move(updateData, new Point(0, 0))
        }
    }
}