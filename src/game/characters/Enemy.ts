import { Component } from "../../engine/component"
import { UpdateData, StartData } from "../../engine/engine"
import { Dude } from "./Dude"
import { Player } from "./Player"
import { Point } from "../../engine/point"

export class Enemy extends Component {

    private dude: Dude

    start(startData: StartData) {
        this.dude = this.entity.getComponent(Dude)
        this.dude.speed *= (.3 + Math.random()/2)  // TODO configure speed for different enemies
        this.dude.weapon.delay = 500
    }

    update(updateData: UpdateData) {
        if (!this.dude.weapon || !this.dude.isAlive) {
            return
        }

        if (!Player.instance.dude.isAlive) {
            this.dude.move(updateData, new Point(0, 0))
            return
        }

        const followDistance = this.dude.weapon.range/2 ?? 20
        const buffer = 0  // this basically determines how long they will stop for if they get too close

        const dist = Player.instance.entity.getComponent(Dude).position.minus(this.dude.position)
        const mag = dist.magnitude()

        if (mag > followDistance || ((followDistance-mag) < buffer && Player.instance.dude.isMoving) && this.dude.isMoving) {
            this.dude.move(updateData, dist)
        } else {
            this.dude.move(updateData, new Point(0, 0))
        }

        if (mag < this.dude.weapon?.range) {
            this.dude.weapon.attack()
        }
    }
}