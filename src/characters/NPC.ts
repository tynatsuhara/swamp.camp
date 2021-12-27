import { Component } from "brigsby/dist/Component"
import { debug } from "brigsby/dist/Debug"
import { UpdateData } from "brigsby/dist/Engine"
import { Point } from "brigsby/dist/Point"
import { LineRender } from "brigsby/dist/renderer/LineRender"
import { Lists } from "brigsby/dist/util/Lists"
import { pixelPtToTilePt, TILE_SIZE } from "../graphics/Tilesets"
import { DialogueDisplay } from "../ui/DialogueDisplay"
import { DudeInteractIndicator } from "../ui/DudeInteractIndicator"
import { tilesAround } from "../Utils"
import { Location } from "../world/Location"
import { camp, LocationManager } from "../world/LocationManager"
import { Teleporter } from "../world/Teleporter"
import { TimeUnit } from "../world/TimeUnit"
import { WorldTime } from "../world/WorldTime"
import { NPCSchedule, NPCSchedules } from "./ai/NPCSchedule"
import { NPCTask } from "./ai/NPCTask"
import { NPCTaskContext } from "./ai/NPCTaskContext"
import { NPCTaskFactory } from "./ai/NPCTaskFactory"
import { Dude } from "./Dude"
import { Player } from "./Player"

/**
 * Shared logic for different types of NPCs. These should be invoked by an NPC controller component.
 */
export class NPC extends Component {
    private dude: Dude

    isEnemyFn: (dude: Dude) => boolean = () => false
    enemyToAttackFilterFn: (enemies: Dude[]) => Dude[] = (enemies) => enemies
    pathFindingHeuristic: (pt: Point, goal: Point) => number = (pt, goal) =>
        pt.manhattanDistanceTo(goal)
    pathIsOccupied: (pt: Point) => boolean = () => false

    findTargetRange = TILE_SIZE * 10
    private enemiesPresent = false
    get timeOfDay() {
        return WorldTime.instance.time % TimeUnit.DAY
    }

    private task: NPCTask

    constructor() {
        super()

        this.awake = () => {
            this.dude = this.entity.getComponent(Dude)

            // set a default schedule
            if (!this.dude.blob[NPCSchedules.SCHEDULE_KEY]) {
                this.setSchedule(NPCSchedules.newFreeRoamSchedule())
            }
        }
    }

    start() {
        this.dude.doWhileLiving(() => this.decideWhatToDo(), 1000 + 1000 * Math.random())
    }

    update(updateData: UpdateData) {
        /**
         * NPC behavior:
         * If threatened, fight or flee
         * otherwise execute a "standard routine" which can be defined by the controller
         */

        // clear their attack target if the target has died
        if (
            !this.attackTarget ||
            !this.attackTarget.isAlive ||
            !this.isEnemyFn(this.attackTarget)
        ) {
            this.attackTarget = null
            this.targetPath = null
        }

        this._attackIndicator = DudeInteractIndicator.NONE

        if (DialogueDisplay.instance.source === this.dude) {
            // don't move when talking
            this.dude.move(
                updateData,
                Point.ZERO,
                Player.instance.dude.standingPosition.x - this.dude.standingPosition.x
            )
        } else if (this.enemiesPresent) {
            // re-check the enemy function for dynamic enemy status
            // (such as demons only targeting people in the dark)
            if (this.attackTarget) {
                this.doAttack(updateData)
            } else {
                this.doRoam(updateData)
            }
        } else {
            this.doNormalScheduledActivity(updateData)
        }
    }

    canTalk = () => {
        return !this.enemiesPresent
    }

    private doNormalScheduledActivity(updateData: UpdateData) {
        if (this.task) {
            const context: NPCTaskContext = {
                dude: this.dude,
                walkTo: (pt) => this.walkTo(pt, updateData),
                roam: (speed, options) => this.doRoam(updateData, speed, options),
                goToLocation: (location) => this.goToLocation(updateData, location), // TODO
                doNothing: () => this.dude.move(updateData, Point.ZERO),
            }
            this.task.performTask(context)
        } else {
            // Stand still and do nothing by default
            this.dude.move(updateData, Point.ZERO)
        }
    }

    static SCHEDULE_FREQUENCY = 10 * TimeUnit.MINUTE

    // TODO: Should this take some time variable to determine how long the simulation is?
    simulate() {
        if (!this.dude.isAlive) {
            return
        }

        this.clearExistingAIState()

        const task = this.getScheduledTask()

        // TODO improve simulation implementations
        const context: NPCTaskContext = {
            dude: this.dude,
            walkTo: (pt) => this.forceMoveToTilePosition(pt),
            roam: (_, options) => {
                const goalOptions = this.getRoamingLocationPossiblities(
                    options?.goalOptionsSupplier
                )
                const pos = Lists.oneOf(goalOptions)
                this.forceMoveToTilePosition(pos)
            },
            goToLocation: (location) => this.simulateGoToLocation(location),
            doNothing: () => {},
        }

        task?.performTask(context)
    }

    setSchedule(schedule: NPCSchedule) {
        this.dude.blob[NPCSchedules.SCHEDULE_KEY] = schedule
        this.clearExistingAIState()
        this.task = this.getScheduledTask()
    }

    getSchedule(): NPCSchedule {
        const schedule: NPCSchedule = this.dude.blob[NPCSchedules.SCHEDULE_KEY]
        if (!schedule) {
            throw new Error(
                `NPCs must have a "${NPCSchedules.SCHEDULE_KEY}" field in the blob. It's possible it got overwritten.`
            )
        }
        return schedule
    }

    private getScheduledTask(): NPCTask {
        return NPCTaskFactory.fromSchedule(this.getSchedule())
    }

    private clearExistingAIState() {
        this.walkPath = null
        this.roamPath = null
        this.attackTarget = null
        this.targetPath = null
        this.teleporterTarget = null
        this.task = null
    }

    private walkPath: Point[] = null
    private walkTo(tilePt: Point, updateData: UpdateData, speedMultiplier: number = 1) {
        // Compute the walking path
        if (
            this.walkPath?.length > 0 &&
            pixelPtToTilePt(Lists.last(this.walkPath)).distanceTo(tilePt) <= 1
        ) {
            // already en route to this spot
        } else if (!this.walkPath || this.walkPath.length === 0) {
            // only try once per upate() to find a path
            this.walkPath = this.findPath(tilePt)
            if (!this.walkPath || this.walkPath.length === 0) {
                this.dude.move(updateData, Point.ZERO)
                return
            }
        }

        this.followPath(this.walkPath, updateData, this.walkPath.length === 1, speedMultiplier)
    }

    private roamPath: Point[] = null
    private roamNextPauseTime: number = -1
    private roamNextUnpauseTime: number = -1
    private doRoam(
        updateData: UpdateData,
        speedMultiplier: number = 1,
        {
            ptSelectionFilter = () => true,
            goalOptionsSupplier,
            pauseEveryMillis,
            pauseForMillis,
        }: {
            ptSelectionFilter?: (pt) => boolean
            goalOptionsSupplier?: () => Point[]
            pauseEveryMillis?: number
            pauseForMillis?: number
        } = {}
    ) {
        // Compute the roaming path
        if (!this.roamPath || this.roamPath.length === 0) {
            // only try once per upate() to find a path
            const openPoints = this.getRoamingLocationPossiblities(goalOptionsSupplier)
            let pt: Point
            for (let i = 0; i < 5 && !pt; i++) {
                const maybePt = Lists.oneOf(openPoints)
                if (ptSelectionFilter(maybePt)) {
                    pt = maybePt
                }
            }
            if (!pt) {
                this.dude.move(updateData, Point.ZERO)
                return
            }
            this.roamPath = this.findPath(pt)
            if (!this.roamPath || this.roamPath.length === 0) {
                this.dude.move(updateData, Point.ZERO)
                return
            }
        }

        // previous pausing parameters will only be cleared if pauseEveryMillis is falsey
        if (pauseEveryMillis) {
            const time = WorldTime.instance.time
            if (time > this.roamNextUnpauseTime) {
                this.roamNextPauseTime = WorldTime.instance.time + pauseEveryMillis
                this.roamNextUnpauseTime = this.roamNextPauseTime + pauseForMillis
            } else if (time > this.roamNextPauseTime) {
                this.dude.move(updateData, Point.ZERO)
                return
            }
        } else {
            this.roamNextPauseTime = -1
            this.roamNextUnpauseTime = -1
        }

        this.followPath(this.roamPath, updateData, false, speedMultiplier)
    }

    private getRoamingLocationPossiblities(goalOptionsSupplier?: () => Point[]) {
        let pts: Point[] = []

        // If there is a leader, just follow them
        const leader = this.getLeader()

        if (leader && leader.isAlive) {
            pts = tilesAround(leader.tile, 3)
        } else if (goalOptionsSupplier) {
            pts = goalOptionsSupplier()
        } else {
            pts = this.dude.location.getGroundSpots()
        }

        return pts.filter((pt) => !this.dude.location.isOccupied(pt))
    }

    private attackTarget: Dude
    get targetedEnemy() {
        return this.attackTarget
    }
    private targetPath: Point[] = null
    private _attackIndicator
    get attackIndicator() {
        return this._attackIndicator
    }
    private readonly PARRY_TIME = 300 + Math.random() * 200
    private nextAttackTime = WorldTime.instance.time + Math.random() * 2000

    private doAttack(updateData: UpdateData) {
        if (!this.dude.isAlive) {
            return
        }

        const weapon = this.dude.weapon

        if (!weapon || !this.attackTarget || !this.attackTarget.isAlive) {
            this.dude.move(updateData, Point.ZERO)
            return
        }

        // TODO maybe switch dynamically between A* and direct walking?

        const dist = this.attackTarget.standingPosition.minus(this.dude.standingPosition)
        const mag = dist.magnitude()

        const stoppingDist = weapon.getStoppingDistance()
        const inRangeAndArmed =
            mag <
            weapon.getRange() +
                // the default collider has a width of 10
                // big entities have a collider width of 15
                (this.dude.colliderSize.x - 10) * 3
        const timeLeftUntilCanAttack = this.nextAttackTime - WorldTime.instance.time

        if (
            stoppingDist === 0 &&
            inRangeAndArmed &&
            this.attackTarget === Player.instance.dude &&
            timeLeftUntilCanAttack < this.PARRY_TIME
        ) {
            this._attackIndicator =
                timeLeftUntilCanAttack < this.PARRY_TIME / 2
                    ? DudeInteractIndicator.ATTACKING_NOW
                    : DudeInteractIndicator.ATTACKING_SOON
        }

        // in range and armed
        if (inRangeAndArmed && timeLeftUntilCanAttack <= 0) {
            weapon.attack(true)
            this.nextAttackTime = Math.max(
                this.nextAttackTime,
                WorldTime.instance.time + weapon.getMillisBetweenAttacks()
            )
        } else {
            weapon.cancelAttack()

            if (stoppingDist > 0 && mag < stoppingDist * 0.75) {
                // TODO make this more configurable?
                this.doRoam(updateData)
                return
            }
        }

        // make sure they always wait at least PARRY_TIME once getting into range
        if (!inRangeAndArmed && timeLeftUntilCanAttack > 0) {
            this.nextAttackTime = Math.max(
                this.nextAttackTime,
                WorldTime.instance.time + this.PARRY_TIME
            )
        }

        if (!this.targetPath || this.targetPath.length === 0) {
            this.targetPath = this.findPath(this.attackTarget.tile)
        }
        if (!this.targetPath || this.targetPath.length === 0 || mag < stoppingDist) {
            // TODO: If using a ranged weapon, keep distance from enemies
            this.dude.move(updateData, Point.ZERO)
            return
        }

        // Make sure they always face their opponent if close
        const facingOverride =
            this.targetPath.length < 2
                ? this.attackTarget.standingPosition.x - this.dude.standingPosition.x
                : 0

        this.followPath(this.targetPath, updateData, false, 1, facingOverride)
    }

    /**
     * @param path the path for the NPC the follow (WILL BE MODIFIED)
     */
    private followPath(
        path: Point[],
        updateData: UpdateData,
        stopWhenClose = false,
        speedMultiplier: number = 1,
        facingOverride: number = 0
    ) {
        const pt = path[0]

        const isCloseEnough = this.dude.standingPosition.distanceTo(pt) < 8

        if (isCloseEnough && stopWhenClose) {
            this.dude.move(updateData, Point.ZERO, facingOverride)
        } else {
            const pos = this.dude.standingPosition
            this.dude.move(
                updateData,
                pt.minus(this.dude.standingPosition),
                facingOverride,
                speedMultiplier
            )
            if (!this.dude.standingPosition.equals(pos)) {
                this.lastMoveTime = new Date().getMilliseconds()
            }
        }

        if (isCloseEnough) {
            path.shift()
        }
    }

    private lastMoveTime: number
    private stuck() {
        return new Date().getMilliseconds() - this.lastMoveTime > 1000
    }

    /**
     * Called on a regular interval (every few seconds)
     * Updates cached tasks, attack targets, etc
     */
    private decideWhatToDo() {
        const foundEnemies = this.checkForEnemies()
        if (!foundEnemies) {
            this.task = this.getScheduledTask()
        }
    }

    /**
     * @returns true if an enemy is encountered
     */
    private checkForEnemies(): boolean {
        let target: Dude

        if (
            this.dude.lastAttacker?.isAlive &&
            this.isEnemyFn(this.dude.lastAttacker) &&
            this.dude.lastAttacker.standingPosition.distanceTo(this.dude.standingPosition) <
                this.findTargetRange
        ) {
            target = this.dude.lastAttacker
        } else {
            let enemies = Array.from(LocationManager.instance.currentLocation.dudes)
                .filter((d) => d.isAlive)
                .filter(this.isEnemyFn)
                .filter(
                    (d) =>
                        d.standingPosition.distanceTo(this.dude.standingPosition) <
                        this.findTargetRange
                )

            this.enemiesPresent = enemies.length > 0
            if (!this.enemiesPresent) {
                return false
            }
            if (!this.dude.weapon) {
                // should flee instead
                return true
            }

            enemies = this.enemyToAttackFilterFn(enemies)

            if (this.attackTarget && enemies.includes(this.attackTarget)) {
                // continue attacking their current target if they're still valid
                target = this.attackTarget
            } else {
                // otherwise attack the closest enemy
                target = Lists.minBy(enemies, (d) =>
                    d.standingPosition.distanceTo(this.dude.standingPosition)
                )
            }
        }

        if (!!target) {
            let shouldComputePath = true

            if (target === this.attackTarget && !!this.targetPath && this.targetPath.length > 0) {
                // We're already tracking this target. Only update the path if they have gotten closer,
                // otherwise the attack() function will automatically extend the path.
                if (this.targetPath.length <= this.dude.tile.manhattanDistanceTo(target.tile)) {
                    shouldComputePath = false
                }
            }

            if (this.stuck()) {
                this.dude.log("stuck")
                shouldComputePath = true
            }

            if (shouldComputePath) {
                this.targetPath = this.findPath(target.tile)
            }

            this.attackTarget = target
        }

        return !!target
    }

    private forceMoveToTilePosition(pt: Point) {
        const pos = this.tilePtToStandingPos(pt)
            .minus(this.dude.standingPosition)
            .plus(this.dude.position)
        this.dude.moveTo(pos, true)
    }

    private findPath(targetTilePoint: Point) {
        // TODO: NPCs can sometimes get stuck if their starting square is "occupied"
        return LocationManager.instance.currentLocation
            .findPath(
                this.dude.tile,
                targetTilePoint,
                this.pathFindingHeuristic,
                this.pathIsOccupied
            )
            ?.map((pt) => this.tilePtToStandingPos(pt))
            .slice(1) // slice(1) because we don't need the start in the path
    }

    private goToLocation(updateData: UpdateData, goalLocation: Location) {
        const nextLocation = this.getNextLocation(goalLocation)
        this.findTeleporter(nextLocation.uuid)
        this.goToTeleporter(updateData, 0.5)
    }

    private simulateGoToLocation(goalLocation: Location) {
        const nextLocation = this.getNextLocation(goalLocation)
        this.useTeleporter(this.dude.location.getTeleporter(nextLocation.uuid))
    }

    private getNextLocation(goalLocation: Location) {
        // For now, we're lazy about this and assume every linked location is
        // at most 1 off from the exterior, so we can avoid doing pathfinding
        if (this.dude.location === camp()) {
            return goalLocation
        } else {
            return camp()
        }
    }

    private teleporterTarget: Teleporter
    private findTeleporter(uuid: string) {
        if (this.teleporterTarget?.to !== uuid) {
            this.teleporterTarget = this.dude.location.getTeleporter(uuid)
        }
    }
    private goToTeleporter(updateData: UpdateData, speedMultiplier: number = 1) {
        if (!this.teleporterTarget) {
            return
        }
        const tilePt = pixelPtToTilePt(this.teleporterTarget.pos)
        this.walkTo(tilePt, updateData, speedMultiplier)
        if (this.dude.tile.manhattanDistanceTo(tilePt) <= 1) {
            this.useTeleporter(this.teleporterTarget)
        }
    }
    private useTeleporter(teleporter: Teleporter) {
        this.dude.location.npcUseTeleporter(this.dude, teleporter)
        this.clearExistingAIState()
    }
    private tilePtToStandingPos(tilePt: Point) {
        const ptOffset = new Point(0.5, 0.8)
        return tilePt.plus(ptOffset).times(TILE_SIZE)
    }

    private leader: Dude
    private getLeader() {
        if (this.leader) {
            if (!this.leader.isAlive || this.leader.location !== this.dude.location) {
                this.setLeader(undefined)
                this.dude.log("stopped following leader")
            }
        }
        const savedLeaderUUID = this.dude.blob["leader"]
        if (!savedLeaderUUID) {
            return undefined
        }
        if (!this.leader) {
            this.leader = Array.from(this.dude.location.dudes).find(
                (d) => d.uuid === savedLeaderUUID
            )
        }
        return this.leader
    }
    setLeader(val?: Dude) {
        this.leader = val
        this.dude.blob["leader"] = val?.uuid
    }

    getRenderMethods() {
        if (!debug.showPathfinding) {
            return []
        }
        if (this.walkPath) {
            return this.renderPath(this.walkPath)
        }
        if (this.roamPath) {
            return this.renderPath(this.roamPath)
        }
        if (this.targetPath) {
            return this.renderPath(this.targetPath)
        }
        return []
    }

    private renderPath(path: Point[], color: string = "#ff0000") {
        if (path.length < 2) {
            return []
        }
        let lineStart = path[0]
        const result = []
        for (let i = 1; i < path.length; i++) {
            const lineEnd = path[i]
            result.push(new LineRender(lineStart, lineEnd, color))
            lineStart = lineEnd
        }
        return result
    }
}
