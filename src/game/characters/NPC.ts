import { Component } from "../../engine/component"
import { UpdateData } from "../../engine/engine"
import { Point } from "../../engine/point"
import { Lists } from "../../engine/util/Lists"
import { pixelPtToTilePt, TILE_SIZE } from "../graphics/Tilesets"
import { DialogueDisplay } from "../ui/DialogueDisplay"
import { LocationManager } from "../world/LocationManager"
import { PointLightMaskRenderer } from "../world/PointLightMaskRenderer"
import { Dude } from "./Dude"
import { NPCSchedule, NPCSchedules, NPCScheduleType } from "./NPCSchedule"
import { Player } from "./Player"
import { TimeUnit } from "../world/TimeUnit"

/**
 * Shared logic for different types of NPCs. These should be invoked by an NPC controller component.
 */
export class NPC extends Component {

    private dude: Dude

    isEnemyFn: (dude: Dude) => boolean = () => false
    pathFindingHeuristic: (pt: Point, goal: Point) => number = (pt, goal) => pt.manhattanDistanceTo(goal)

    findTargetRange = TILE_SIZE * 10
    private enemiesPresent = false

    constructor(defaultSchedule: NPCSchedule = NPCSchedules.newNoOpSchedule()) {
        super()

        this.awake = () => {
            this.dude = this.entity.getComponent(Dude)
            if (!this.dude.blob[NPCSchedules.SCHEDULE_KEY]) {
                this.setSchedule(defaultSchedule)
            }
        }
    }

    awake() {
    }

    start() {
        this.doWhileLiving(() => this.checkForEnemies(), 1000 + 1000 * Math.random())
    }

    update(updateData: UpdateData) {
        /**
         * NPC behavior:
         * If threated, fight or flee
         * otherwise follow their followTarget (if present)
         * otherwise execute a "standard routine" which can be defined by the controller (TODO)
         */

        // clear their attack target if the target has died
        if (!!this.attackTarget && !this.attackTarget.isAlive) {
            this.attackTarget = null
            this.targetPath = null
        }

        if (DialogueDisplay.instance.dialogueSource === this.dude) {
            // don't move when talking
            this.dude.move(updateData, Point.ZERO, Player.instance.dude.standingPosition.x - this.dude.standingPosition.x)
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
        } else if (schedule.type === NPCScheduleType.ROAM) {
            this.doFlee(updateData, 0.5)
        } else if (schedule.type === NPCScheduleType.ROAM_IN_DARKNESS) {
            this.doFlee(
                updateData, 
                PointLightMaskRenderer.instance.isDark(this.dude.standingPosition) ? 0.5 : 1,
                (pt) => PointLightMaskRenderer.instance.isDark(pt.times(TILE_SIZE))
            )
        } else if (schedule.type === NPCScheduleType.DEFAULT_VILLAGER) {
            const location = LocationManager.instance.currentLocation
            this.doFlee(updateData, 0.5)
        } else {
            throw new Error("unimplemented schedule type")
        }
    }

    /**
     * TODO: Support simulation for NPCs which are not in the current location?
     * Example: You're in an NPC's house, they should come inside when it's time. 
     * Alternatively, this could be done using the EventQueue.
     */
    static SCHEDULE_FREQUENCY = 10 * TimeUnit.MINUTE
    
    simulate() {
        this.clearExistingAIState()
        const schedule = this.getSchedule()
        
        if (schedule.type === NPCScheduleType.GO_TO_SPOT) {
            this.forceMoveToTilePosition(Point.fromString(schedule["p"]))
        } else if (schedule.type === NPCScheduleType.DEFAULT_VILLAGER) {
            // TODO
        }
    }

    setSchedule(schedule) {
        this.dude.blob[NPCSchedules.SCHEDULE_KEY] = schedule
    }

    getSchedule(): NPCSchedule {
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
        this.targetPath = null
        // this.followTarget = null
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
    private doFlee(updateData: UpdateData, speedMultiplier: number = 1, ptSelectionFilter: (pt) => boolean = () => true) {
        if (!this.fleePath || this.fleePath.length === 0) {  // only try once per upate() to find a path
            const l = LocationManager.instance.currentLocation
            const openPoints = l.ground.keys().filter(pt => !l.isOccupied(pt))
            let pt: Point
            for (let i = 0; i < 5; i++) {
                pt = openPoints[Math.floor(Math.random() * openPoints.length)]
                if (ptSelectionFilter(pt)) {
                    break
                }
            }
            if (!pt) {
                this.dude.move(updateData, Point.ZERO)
                return
            }
            this.fleePath = this.findPath(pt)
            if (!this.fleePath || this.fleePath.length === 0) {
                this.dude.move(updateData, Point.ZERO)
                return
            }
        }
        if (this.walkDirectlyTo(this.fleePath[0], updateData, false, speedMultiplier)) {
            this.fleePath.shift()
        }
    }

    // Can be called very update()
    // follow(followTarget: Dude) {
    //     // TODO we probably want to make this serializable (character uuid?) if we end up using it
    //     this.followTarget = followTarget
    // }

    private attackTarget: Dude
    private targetPath: Point[] = null
    private doAttack(updateData: UpdateData) {
        if (!this.dude.isAlive) {
            return
        }

        if (!this.dude.weapon || !this.attackTarget || !this.targetPath || !this.attackTarget.isAlive) {
            this.dude.move(updateData, Point.ZERO)
            return
        }

        // TODO maybe switch dynamically between A* and direct walking?

        // const followDistance = this.dude.weapon.getRange()/2 ?? 20
        // const buffer = 0  // this basically determines how long they will stop for if they get too close

        const dist = this.attackTarget.standingPosition.minus(this.dude.standingPosition)
        const mag = dist.magnitude()

        // if (mag > followDistance || ((followDistance-mag) < buffer && this.attackTarget.isMoving) && this.dude.isMoving) {
        //     this.dude.move(updateData, dist)
        // } else {
        //     this.dude.move(updateData, new Point(0, 0))
        // }

        if (mag < this.dude.weapon?.getRange()) {
            this.dude.weapon.attack(true)
        } else {
            this.dude.weapon.cancelAttack()
        }

        if (this.targetPath.length === 0) {
            this.targetPath = this.findPath(pixelPtToTilePt(this.attackTarget.standingPosition), this.dude.standingPosition)
        }
        if (!this.targetPath || this.targetPath.length === 0) {
            this.dude.move(updateData, Point.ZERO)
            return
        }

        if (this.walkDirectlyTo(
            this.targetPath[0], 
            updateData, 
            false, 
            1, 
            this.targetPath.length < 2 ? (this.attackTarget.standingPosition.x - this.dude.standingPosition.x) : 0
        )) {
            this.targetPath.shift()
        }
    }

    // private followTarget: Dude
    // private doFollow(updateData: UpdateData) {
    //     const followDistance = 75
    //     const buffer = 40  // this basically determines how long they will stop for if they get too close

    //     const dist = Player.instance.dude.standingPosition.minus(this.dude.standingPosition)
    //     const mag = dist.magnitude()

    //     if (mag > followDistance || ((followDistance-mag) < buffer && Player.instance.dude.isMoving) && this.dude.isMoving) {
    //         this.dude.move(updateData, dist)
    //     } else {
    //         this.dude.move(updateData, new Point(0, 0))
    //     }
    // }

    // returns true if they are pretty close (half a tile) away from the goal
    private walkDirectlyTo(pt: Point, updateData: UpdateData, stopWhenClose = false, speedMultiplier: number = 1, facingOverride: number = 0) {
        const isCloseEnough = this.isCloseEnoughToStopWalking(pt)
        if (isCloseEnough && stopWhenClose) {
            this.dude.move(updateData, Point.ZERO, facingOverride)
        } else {
            const pos = this.dude.standingPosition
            this.dude.move(updateData, pt.minus(this.dude.standingPosition), facingOverride, speedMultiplier)
            if (!this.dude.standingPosition.equals(pos)) {
                this.lastMovePos = new Date().getMilliseconds()
            }
        }
        return isCloseEnough
    }

    private lastMovePos: number 
    private stuck() { return new Date().getMilliseconds() - this.lastMovePos > 1000 }

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

        const target = Lists.minBy(enemies, d => d.standingPosition.distanceTo(this.dude.standingPosition))
        if (!!target) {
            let shouldComputePath = true

            if (target === this.attackTarget && !!this.targetPath && this.targetPath.length > 0) {
                // We're already tracking this target. Only update the path if they have gotten closer, 
                // otherwise the attack() function will automatically extend the path.
                // const currentGoal = pixelPtToTilePt(this.targetPath[this.targetPath.length-1])
                const newGoal = pixelPtToTilePt(target.standingPosition)
                const currentPos = pixelPtToTilePt(this.dude.standingPosition)
                if (this.targetPath.length <= currentPos.manhattanDistanceTo(newGoal)) {
                    shouldComputePath = false
                }
            }

            if (this.stuck) {
                shouldComputePath = true
            }

            if (shouldComputePath) {
                this.targetPath = this.findPath(pixelPtToTilePt(target.standingPosition))
            }

            this.attackTarget = target
        }
    }

    private forceMoveToTilePosition(pt: Point) {
        const pos = this.tilePtToStandingPos(pt).minus(this.dude.standingPosition).plus(this.dude.position)
        this.dude.moveTo(pos)
    }

    private findPath(tilePt: Point, pixelPtStart: Point = this.dude.standingPosition) {
        const start = pixelPtToTilePt(pixelPtStart)
        const end = tilePt
        // TODO: NPCs can sometimes get stuck if their starting square is "occupied"
        return LocationManager.instance.currentLocation
                .findPath(start, end, this.pathFindingHeuristic)
                ?.map(pt => this.tilePtToStandingPos(pt)).slice(1)  // slice(1) because we don't need the start in the path
    }

    private tilePtToStandingPos(tilePt: Point) {
        const ptOffset = new Point(.5, .8)
        return tilePt.plus(ptOffset).times(TILE_SIZE)
    }
}