import { Component } from "../../engine/component"
import { UpdateData } from "../../engine/engine"
import { Dude } from "./Dude"
import { Player } from "./Player"
import { Point } from "../../engine/point"
import { LocationManager } from "../world/LocationManager"
import { pixelPtToTilePt, TILE_SIZE } from "../graphics/Tilesets"
import { Lists } from "../../engine/util/Lists"
import { NPCSchedule, NPCScheduleType, NPCSchedules } from "./NPCSchedule"
import { DialogueDisplay } from "../ui/DialogueDisplay"

/**
 * Shared logic for different types of NPCs. These should be invoked by an NPC controller component.
 */
export class NPC extends Component {

    private dude: Dude

    isEnemyFn: (dude: Dude) => boolean = () => false
    private findTargetRange = TILE_SIZE * 10
    private enemiesPresent = false

    constructor(defaultSchedule: NPCSchedule = NPCSchedules.newNoOpSchedule()) {
        super()

        this.awake = () => {
            this.dude = this.entity.getComponent(Dude)
            if (!this.dude.blob[NPCSchedules.SCHEDULE_KEY]) {
                this.dude.blob[NPCSchedules.SCHEDULE_KEY] = defaultSchedule
            }
        }
    }

    awake() {
    }

    start() {
        this.doWhileLiving(() => this.checkForEnemies(), 700 + 600 * Math.random())
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

        if (DialogueDisplay.instance.dude === this.dude) {
            this.dude.move(updateData, Point.ZERO)
        } else if (this.enemiesPresent) {
            if (!!this.attackTarget) {
                this.doAttack(updateData)
            } else {
                this.doFlee(updateData)
            }
        } else {
            this.doNormalScheduledActivity(updateData)
        }
    }

    private doNormalScheduledActivity(updateData: UpdateData) {
        const schedule = this.getSchedule()
        
        if (schedule.type === NPCScheduleType.DO_NOTHING) {
            this.dude.move(updateData, Point.ZERO)
        } else if (schedule.type === NPCScheduleType.GO_TO_SPOT) {
            this.walkTo(
                Point.fromString(schedule["p"]), 
                updateData
            )
        }
    }

    simulate() {
        this.clearExistingAIState()
        const schedule = this.getSchedule()
        
        if (schedule.type === NPCScheduleType.DO_NOTHING) {
            // do nothing
        } else if (schedule.type === NPCScheduleType.GO_TO_SPOT) {
            console.log("before = " + this.dude.position)
            this.forceMoveToTilePosition(Point.fromString(schedule["p"]))
            console.log("after = " + this.dude.position)
        }
    }

    private getSchedule(): NPCSchedule {
        const schedule: NPCSchedule = this.dude.blob[NPCSchedules.SCHEDULE_KEY]
        if (!schedule) {
            throw new Error(`NPCs must have a "${NPCSchedules.SCHEDULE_KEY}" field in the blob. It's possible it got overwritten.`)
        }
        return schedule
    }

    private clearExistingAIState() {
        this.walkPath = null
        this.fleePath = null
        this.attackTarget = null
        this.followTarget = null
    }

    // fn will execute immediately and every intervalMillis milliseconds until the NPC is dead
    doWhileLiving(fn: () => void, intervalMillis: number) {
        if (this.dude.isAlive) {
            fn()
        }
        const interval = setInterval(() => {
            if (!this.dude.isAlive) {
                clearInterval(interval)
            } else {
                fn()
            }
        }, intervalMillis)
    }

    private walkPath: Point[] = null
    private walkTo(tilePt: Point, updateData: UpdateData) {
        // TODO: make sure the existing path is to the same pt
        if (!this.walkPath || this.walkPath.length === 0) {  // only try once per upate() to find a path
            this.walkPath = this.findPath(tilePt)
            if (!this.walkPath || this.walkPath.length === 0) {
                this.dude.move(updateData, Point.ZERO)
                return
            }
        }
        if (this.walkDirectlyTo(this.walkPath[0], updateData, this.walkPath.length === 1)) {
            this.walkPath.shift()
        }
    }

    private fleePath: Point[] = null
    private doFlee(updateData: UpdateData) {
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
        if (this.walkDirectlyTo(this.fleePath[0], updateData)) {
            this.fleePath.shift()
        }
    }

    // Can be called very update()
    // follow(followTarget: Dude) {
    //     // TODO we probably want to make this serializable (character uuid?) if we end up using it
    //     this.followTarget = followTarget
    // }

    // TODO support pathfinding for attacking
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
    private walkDirectlyTo(pt: Point, updateData: UpdateData, stopWhenClose = false) {
        // const dist = this.dude.standingPosition.distanceTo(pt)
        const isCloseEnough = this.isCloseEnoughToStopWalking(pt)
        if (isCloseEnough && stopWhenClose) {
            this.dude.move(updateData, Point.ZERO)
        } else {
            this.dude.move(updateData, pt.minus(this.dude.standingPosition), 0)
        }
        return isCloseEnough
    }

    private isCloseEnoughToStopWalking(pt: Point) {
        return this.dude.standingPosition.distanceTo(pt) < 8
    }

    private checkForEnemies() {
        let enemies = Array.from(LocationManager.instance.currentLocation.dudes)
                .filter(d => d.isAlive)
                .filter(this.isEnemyFn)
                .filter(d => d.standingPosition.distanceTo(this.dude.standingPosition) < this.findTargetRange)

        this.enemiesPresent = enemies.length > 0
        if (!this.dude.weapon) {
            // should flee instead
            return
        }
        
        // attack armed opponents first
        if (enemies.some(d => !!d.weapon)) {
            enemies = enemies.filter(d => !!d.weapon)
        }

        const target = Lists.minBy(enemies, d => d.position.distanceTo(this.dude.position))
        if (!!target) {
            this.attackTarget = target
        }
    }

    private forceMoveToTilePosition(pt: Point) {
        const pos = this.tilePtToStandingPos(pt).minus(this.dude.standingPosition).plus(this.dude.position)
        this.dude.moveTo(pos)
    }

    private findPath(tilePt: Point, h: (pt: Point) => number = (pt) => pt.distanceTo(end)) {
        const start = pixelPtToTilePt(this.dude.standingPosition)
        const end = tilePt
        return LocationManager.instance.currentLocation.elements.findPath(
            start, 
            end, 
            h,
            (pt) => (pt === start ? false : !!LocationManager.instance.currentLocation.elements.get(pt))  // prevent getting stuck "inside" a square
        )?.map(pt => this.tilePtToStandingPos(pt)).slice(1)  // slice(1) because we don't need the start in the path
    }

    private tilePtToStandingPos(tilePt: Point) {
        const ptOffset = new Point(.5, .8)
        return tilePt.plus(ptOffset).times(TILE_SIZE)
    }
}