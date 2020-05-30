import { Component } from "../../engine/component"
import { UpdateData, StartData } from "../../engine/engine"
import { Dude } from "./Dude"
import { Point } from "../../engine/point"
import { LocationManager } from "../world/LocationManager"
import { TILE_SIZE } from "../graphics/Tilesets"
import { Lists } from "../../engine/util/Lists"

export class Enemy extends Component {

    private dude: Dude

    private dudeTarget: Dude
    private findTargetRange = TILE_SIZE * 10

    start(startData: StartData) {
        this.dude = this.entity.getComponent(Dude)
        this.dude.weapon.delay = 500
        this.obtainTarget()
    }

    update(updateData: UpdateData) {
        if (!this.dude.weapon || !this.dude.isAlive) {
            return
        }

        if (!this.dudeTarget || !this.dudeTarget.isAlive) {
            this.dude.move(updateData, new Point(0, 0))
            return
        }

        const followDistance = this.dude.weapon.range/2 ?? 20
        const buffer = 0  // this basically determines how long they will stop for if they get too close

        const dist = this.dudeTarget.position.minus(this.dude.position)
        const mag = dist.magnitude()

        if (mag > followDistance || ((followDistance-mag) < buffer && this.dudeTarget.isMoving) && this.dude.isMoving) {
            this.dude.move(updateData, dist)
        } else {
            this.dude.move(updateData, new Point(0, 0))
        }

        if (mag < this.dude.weapon?.range) {
            this.dude.weapon.attack()
        }
    }

    obtainTarget() {
        let possibilities = Array.from(LocationManager.instance.currentLocation.dudes)
                .filter(d => d.faction != this.dude.faction)
                .filter(d => d.standingPosition.distanceTo(this.dude.standingPosition) < this.findTargetRange)
        
        // attack enenmies 
        if (possibilities.some(d => !!d.weapon)) {
            possibilities = possibilities.filter(d => !!d.weapon)
        }

        this.dudeTarget = Lists.minBy(possibilities, d => d.position.distanceTo(this.dude.position))
    }
}