import { Component } from "../../engine/component"
import { UpdateData, StartData } from "../../engine/engine"
import { Dude } from "./Dude"
import { Player } from "./Player"
import { Point } from "../../engine/point"

/**
 * Shared logic for different types of NPCs. These should be invoked by an NPC controller component.
 */
export class NPC extends Component {

    private dude: Dude

    awake(startData: StartData) {
        this.dude = this.entity.getComponent(Dude)
    }

    update(updateData: UpdateData) {
        /**
         * NPC behavior:
         * If threated, fight or flee
         * otherwise follow their followTarget (if present)
         * otherwise execute a "standard routine" which can be defined by the controller (TODO)
         */

        if (!!this.attackTarget && !this.attackTarget.isAlive) {
            this.attackTarget = null  // no need to attack a dead dude
        }

        if (!!this.attackTarget) {
            this.doAttack(updateData)
        } else if (!!this.followTarget) {
            this.doFollow(updateData)
        } else {
            // TODO: later add a standard routine (eg patrolling for guards, walking around for villagers)
            this.dude.move(updateData, Point.ZERO)
        }
    }

    // Can be called very update()
    follow(followTarget: Dude) {
        this.followTarget = followTarget
    }

    attack(attackTarget: Dude) {
        this.attackTarget = attackTarget
    }

    // TODO
    // flee() {}

    private attackTarget: Dude
    private doAttack(updateData: UpdateData) {
        if (!this.dude.weapon || !this.dude.isAlive) {
            return
        }

        if (!this.attackTarget || !this.attackTarget.isAlive) {
            this.dude.move(updateData, new Point(0, 0))
            return
        }

        const followDistance = this.dude.weapon.range/2 ?? 20
        const buffer = 0  // this basically determines how long they will stop for if they get too close

        const dist = this.attackTarget.position.minus(this.dude.position)
        const mag = dist.magnitude()

        if (mag > followDistance || ((followDistance-mag) < buffer && this.attackTarget.isMoving) && this.dude.isMoving) {
            this.dude.move(updateData, dist)
        } else {
            this.dude.move(updateData, new Point(0, 0))
        }

        if (mag < this.dude.weapon?.range) {
            this.dude.weapon.attack()
        }
    }

    private followTarget: Dude
    private doFollow(updateData: UpdateData) {
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