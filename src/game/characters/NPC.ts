import { Component } from "../../engine/component"
import { UpdateData, StartData } from "../../engine/engine"
import { Dude } from "./Dude"
import { Player } from "./Player"
import { Point } from "../../engine/point"
import { WorldLocation } from "../world/WorldLocation"
import { LocationManager } from "../world/LocationManager"
import { pixelPtToTilePt, TILE_SIZE } from "../graphics/Tilesets"
import { MapGenerator } from "../world/MapGenerator"
import { Lists } from "../../engine/util/Lists"

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
        // } else if (!!this.followTarget) {
        //     this.doFollow(updateData)
        } else {
            // TODO: later add a standard routine (eg patrolling for guards, walking around for villagers)
            this.flee(updateData)
        }
    }

    private fleePath: Point[] = null
    private flee(updateData: UpdateData) {
        if (!this.fleePath || this.fleePath.length === 0) {  // only try once per upate() to find a path
            const l = LocationManager.instance.currentLocation
            const openPoints = l.ground.keys().filter(pt => !l.elements.get(pt))
            const pt = openPoints[Math.floor(Math.random() * openPoints.length)]
            this.fleePath = this.findPath(pt)
            if (!this.fleePath || this.fleePath.length === 0) {
                this.dude.move(updateData, Point.ZERO)
                return
            }
        }
        if (this.walkTo(this.fleePath[0], updateData)) {
            this.fleePath.shift()
        }
    }

    // Can be called very update()
    // follow(followTarget: Dude) {
    //     // TODO we probably want to make this serializable (character uuid?) if we end up using it
    //     this.followTarget = followTarget
    // }

    attack(attackTarget: Dude) {
        this.attackTarget = attackTarget
    }

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

    // returns true if they are pretty close (half a tile) away from the goal
    private walkTo(pt: Point, updateData: UpdateData) {
        const dist = this.dude.standingPosition.distanceTo(pt)
        this.dude.move(updateData, pt.minus(this.dude.standingPosition))
        return dist < 8
    }

    private findPath(tilePt: Point, h: (pt: Point) => number = (pt) => pt.distanceTo(end)) {
        const start = pixelPtToTilePt(this.dude.standingPosition)
        const end = tilePt
        return LocationManager.instance.currentLocation.elements.findPath(start, end, h)?.map(pt => pt.plus(new Point(.5, .8)).times(TILE_SIZE))
    }
}