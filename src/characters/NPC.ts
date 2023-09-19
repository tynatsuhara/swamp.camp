import { debug, Point, PointValue, pt, UpdateData } from "brigsby/dist"
import { LineRender } from "brigsby/dist/renderer"
import { Lists } from "brigsby/dist/util"
import { isGamePaused } from "../core/PauseState"
import { pixelPtToTilePt, TILE_SIZE } from "../graphics/Tilesets"
import { session } from "../online/session"
import { syncData } from "../online/syncUtils"
import { DialogueDisplay } from "../ui/DialogueDisplay"
import { tilesAround } from "../utils/misc"
import { Burnable } from "../world/elements/Burnable"
import { Campfire } from "../world/elements/Campfire"
import { ElementType } from "../world/elements/ElementType"
import { Ground, GroundType } from "../world/ground/Ground"
import { LightManager } from "../world/LightManager"
import { Location } from "../world/locations/Location"
import { camp, here, LocationManager } from "../world/locations/LocationManager"
import { Simulatable } from "../world/Simulatable"
import { TimeUnit } from "../world/TimeUnit"
import { WorldTime } from "../world/WorldTime"
import { NPCSchedule, NPCSchedules } from "./ai/NPCSchedule"
import { NPCTask } from "./ai/NPCTask"
import { NPCTaskContext, WalkToOptions } from "./ai/NPCTaskContext"
import { NPCTaskFactory } from "./ai/NPCTaskFactory"
import { Condition } from "./Condition"
import { AttackState, Dude } from "./Dude"
import { DudeFaction } from "./DudeFactory"
import { DudeType } from "./DudeType"
import { player } from "./player"
import { Centaur } from "./types/Centaur"
import { ShroomNPC } from "./types/ShroomNPC"

type NpcOptions = {
    blockProficiency: number // 0-1
}

const DEFAULT_OPTIONS: NpcOptions = {
    blockProficiency: 0.25,
}

type SyncData = {
    t: string | undefined // target uuid
}

/**
 * Shared logic for different types of NPCs. These should be invoked by an NPC controller component.
 */
export class NPC extends Simulatable {
    private _dude: Dude
    get dude() {
        return this._dude
    }

    private syncData: SyncData

    // Default behavior:
    //   - An enemy is something that will probably attack them
    //   - Members of the same faction are never enemies
    isEnemyFn: (dude: Dude) => boolean = (d) => {
        if (!d.entity || d.factions.some((fac) => this.dude.factions.includes(fac))) {
            return false
        }

        // Only fight demons if they're in the dark or really close to the demon
        if (d.factions.includes(DudeFaction.DEMONS)) {
            return (
                LightManager.instance.isDark(this.dude.standingPosition) ||
                d.standingPosition.distanceTo(this.dude.standingPosition) < 30
            )
        }

        // Only fight shrooms if the shroom is aggro
        if (d.factions.includes(DudeFaction.SHROOMS)) {
            return d.entity.getComponent(ShroomNPC).isAggro()
        }

        // Only fight centaurs if the centaur is aggro
        if (d.factions.includes(DudeFaction.CENTAURS)) {
            return d.entity.getComponent(Centaur).isAggro()
        }

        // Only fight acquatic creatures when in the water
        if (d.factions.includes(DudeFaction.AQUATIC)) {
            return Ground.isWater(this.dude.location.getGround(this.dude.tile)?.type)
        }

        // Only fight a mimic if it is no longer pretending to be a chest
        if (d.type === DudeType.MIMIC) {
            return !!d.entity.getComponent(NPC).targetedEnemy
        }

        return true
    }

    // override logic for selecting a target enemy out of possible options
    enemyToAttackFilterFn: (enemies: Dude[]) => Dude[] = (enemies) => enemies
    pathFindingHeuristic: (pt: Point, goal: Point) => number = (pt, goal) =>
        pt.manhattanDistanceTo(goal)
    extraPathIsOccupiedFilter: (pt: Point) => boolean = () => false

    findTargetRange = TILE_SIZE * 10
    enemiesPresent = false

    private task: NPCTask

    private options: NpcOptions

    constructor(options: Partial<NpcOptions> = {}) {
        super()

        this.options = { ...DEFAULT_OPTIONS, ...options }

        this.awake = () => {
            this._dude = this.entity.getComponent(Dude)
            const syncId = this.dude.uuid.substring(0, 8)

            this.syncData = syncData(
                `${syncId}npcd`,
                {
                    t: undefined,
                },
                (newData) => {
                    this.attackTarget = Dude.get(newData.t)
                }
            )

            // set a default schedule
            if (!this._dude.blob[NPCSchedules.SCHEDULE_KEY]) {
                this.setSchedule(NPCSchedules.newFreeRoamSchedule())
            }
        }
    }

    start() {
        if (session.isHost()) {
            this._dude.doWhileLiving(() => {
                this.decideWhatToDoNext()
                return 1000 + 1000 * Math.random()
            })
        }
    }

    update(updateData: UpdateData) {
        if (session.isGuest() || isGamePaused()) {
            return
        }

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
            this.syncData.t = null
            this.targetPath = null
            this.dude.updateBlocking(false)
        }

        this.dude.attackState = AttackState.NOT_ATTACKING

        if (DialogueDisplay.instance.currentSource === this._dude) {
            // don't move when talking
            this._dude.move(
                updateData.elapsedTimeMillis,
                Point.ZERO,
                player().standingPosition.x - this._dude.standingPosition.x
            )
        } else if (this._dude.hasCondition(Condition.ON_FIRE)) {
            this.doRoam(updateData) // flee
        } else if (this.enemiesPresent) {
            // re-check the enemy function for dynamic enemy status
            // (such as demons only targeting people in the dark)
            if (this.attackTarget && this.isEnemyFn(this.attackTarget)) {
                this.doCombat(updateData)
            } else {
                this.doRoam(updateData) // flee
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
                dude: this._dude,
                walkTo: (pt, options) => this.walkTo(pt, updateData, options),
                roam: (speed, options) => this.doRoam(updateData, speed, options),
                goToLocation: (location) => this.goToLocation(updateData, location), // TODO
                doNothing: () => this._dude.move(updateData.elapsedTimeMillis, Point.ZERO),
            }
            this.task.performTask(context)
        } else {
            // Stand still and do nothing by default
            this._dude.move(updateData.elapsedTimeMillis, Point.ZERO)
        }
    }

    static SCHEDULE_FREQUENCY = 10 * TimeUnit.MINUTE

    simulate(duration: number) {
        if (!this._dude.isAlive) {
            return
        }

        this.clearExistingAIState()

        const task = this.getScheduledTask()

        // TODO improve simulation implementations
        const context: NPCTaskContext = {
            dude: this._dude,
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
        this._dude.blob[NPCSchedules.SCHEDULE_KEY] = schedule
        this.clearExistingAIState()
        this.task = this.getScheduledTask()
    }

    getSchedule(): NPCSchedule {
        const schedule: NPCSchedule = this._dude.blob[NPCSchedules.SCHEDULE_KEY]
        if (!schedule) {
            throw new Error(
                `NPCs must have a "${NPCSchedules.SCHEDULE_KEY}" field in the blob. It's possible it got overwritten.`
            )
        }
        return schedule
    }

    private getScheduledTask(): NPCTask {
        return NPCTaskFactory.fromSchedule(this)
    }

    private clearExistingAIState() {
        this.walkPath = null
        this.interactWith = null
        this.roamPath = null
        this.attackTarget = null
        this.syncData.t = null
        this.targetPath = null
        this.teleporterTarget = null
        this.task = null
    }

    private walkPath: Point[] = null

    private walkTo(tilePt: Point, updateData: UpdateData, options: WalkToOptions = {}) {
        this.interactWith = options.interactWith
        const facingOverrideAtEnd = this.interactWith ? this.interactWith.x - tilePt.x : undefined

        // Compute the walking path
        if (
            this.walkPath?.length > 0 &&
            pixelPtToTilePt(Lists.last(this.walkPath)).distanceTo(tilePt) <= 1
        ) {
            // already en route to this spot
        } else if (!this.walkPath || this.walkPath.length === 0) {
            // only try once per update() to find a path
            this.walkPath = this.findPath(tilePt)
            if (!this.walkPath || this.walkPath.length === 0) {
                this._dude.move(updateData.elapsedTimeMillis, Point.ZERO, facingOverrideAtEnd)
                return
            }
        }

        this.followPath(
            this.walkPath,
            updateData,
            this.walkPath.length === 1,
            options.speedMultiplier,
            0,
            facingOverrideAtEnd
        )
    }

    getInteractWithGoal() {
        return this.interactWith
    }
    getInteractWithElement() {
        return this.dude.location.getElement(this.getInteractWithGoal())
    }
    private get interactWith() {
        const xy: PointValue = this.dude.blob["interactwith"]
        if (!xy) {
            return
        }
        return new Point(xy.x, xy.y)
    }
    private set interactWith(val: Point) {
        this.dude.blob["interactwith"] = val
    }

    isInteracting() {
        // rough proxy for "they've walked there and stopped walking"
        return (
            !!this.interactWith &&
            this.dude.tile.manhattanDistanceTo(this.interactWith) <= 2 &&
            !this.dude.isMoving
        )
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
        // make sure this field gets cleared out if they're no longer walking
        this.interactWith = undefined

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
                this._dude.move(updateData.elapsedTimeMillis, Point.ZERO)
                return
            }
            this.roamPath = this.findPath(pt)
            if (!this.roamPath || this.roamPath.length === 0) {
                this._dude.move(updateData.elapsedTimeMillis, Point.ZERO)
                return
            }
        }

        // previous pausing parameters will only be cleared if pauseEveryMillis is falsey
        if (pauseEveryMillis) {
            const time = WorldTime.instance.time
            const shouldNotPause = Ground.isWater(
                this.dude.location.getGround(this.dude.tile)?.type
            )
            // TODO: make it so NPCs dont roam immediately on save load?
            if (time > this.roamNextUnpauseTime || shouldNotPause) {
                this.roamNextPauseTime = WorldTime.instance.time + pauseEveryMillis
                this.roamNextUnpauseTime = this.roamNextPauseTime + pauseForMillis
            } else if (time > this.roamNextPauseTime) {
                this._dude.move(updateData.elapsedTimeMillis, Point.ZERO)
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
            pts = this._dude.location.getWalkableGroundSpots()
        }

        return pts.filter((pt) => !this._dude.location.isOccupied(pt))
    }

    private attackTarget: Dude
    get targetedEnemy() {
        return this.attackTarget
    }
    private targetPath: Point[] = null
    private readonly PARRY_TIME = 300 + Math.random() * 200
    private nextAttackTime = WorldTime.instance.time + Math.random() * 2000

    private doCombat(updateData: UpdateData) {
        if (!this._dude.isAlive) {
            return
        }

        const weapon = this._dude.weapon

        if (!weapon || !this.attackTarget || !this.attackTarget.isAlive) {
            this._dude.move(updateData.elapsedTimeMillis, Point.ZERO)
            this.decideWhatToDoNext()
            return
        }

        // TODO: BUG: It seems like enemies won't attack if they're standing at the exact same pt as their target

        // TODO maybe switch dynamically between A* and direct walking?

        const dist = this.attackTarget.standingPosition.minus(this._dude.standingPosition)
        const mag = dist.magnitude()

        const stoppingDist = weapon.getStoppingDistance()
        const inRangeAndArmed =
            mag <
            weapon.getRange() +
                // the default collider has a width of 10
                // big entities have a collider width of 15
                (this._dude.colliderSize.x - 10) * 3
        const timeLeftUntilCanAttack = this.nextAttackTime - WorldTime.instance.time

        if (stoppingDist === 0 && inRangeAndArmed && timeLeftUntilCanAttack < this.PARRY_TIME) {
            this.dude.attackState =
                timeLeftUntilCanAttack < this.PARRY_TIME / 2
                    ? AttackState.ATTACKING_NOW
                    : AttackState.ATTACKING_SOON
        }

        const shouldTryToBlock =
            this.dude.shield &&
            this.dude.isFacing(this.attackTarget.standingPosition) &&
            this.isAttackTargetAttacking()

        if (shouldTryToBlock && this.doCombatBlock()) {
            this.dude.updateBlocking(true)
        } else {
            this.dude.updateBlocking(false)

            if (inRangeAndArmed && timeLeftUntilCanAttack <= 0) {
                this.dude.updateAttacking(true)
                this.nextAttackTime = Math.max(
                    this.nextAttackTime,
                    WorldTime.instance.time + weapon.getMillisBetweenAttacks()
                )
            } else {
                this.dude.cancelAttacking()

                if (stoppingDist > 0 && mag < stoppingDist * 0.75) {
                    // TODO make this more configurable?
                    this.doRoam(updateData)
                    return
                }
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
            this.targetPath = this.findPathToAttackTarget(this.attackTarget)
        }
        if (!this.targetPath || this.targetPath.length === 0 || mag < stoppingDist) {
            // TODO: If using a ranged weapon, keep distance from enemies
            this._dude.move(
                updateData.elapsedTimeMillis,
                Point.ZERO,
                // make sure they face the target, otherwise enemies can get stuck
                // if they're standing in the same tile as their target
                this.attackTarget.standingPosition.x - this._dude.standingPosition.x
            )
            return
        }

        // Make sure they always face their opponent if close
        const facingOverride =
            this.targetPath.length < 2
                ? this.attackTarget.standingPosition.x - this._dude.standingPosition.x
                : 0

        this.followPath(this.targetPath, updateData, false, 1, facingOverride)
    }

    // block state
    private nextBlockCheckTime: number
    private canBlockRightNow = false

    /**
     * @returns true if blocking
     */
    private doCombatBlock(): boolean {
        // cache the block state for a while so we don't evaluate it every tick
        if (WorldTime.instance.time < this.nextBlockCheckTime) {
            return this.canBlockRightNow
        }

        this.canBlockRightNow = Math.random() < this.options.blockProficiency

        if (this.canBlockRightNow) {
            const blockTimeMs = 250 + 250 * Math.random()
            this.nextBlockCheckTime = WorldTime.instance.time + blockTimeMs
        } else {
            this.nextBlockCheckTime = WorldTime.instance.time + 1_000 // TODO: Is this a good value?
        }
    }

    private isAttackTargetAttacking(): boolean {
        if (
            [AttackState.ATTACKING_SOON, AttackState.ATTACKING_NOW].includes(
                this.attackTarget.attackState
            )
        ) {
            return true
        }

        if (
            this.attackTarget.type === DudeType.PLAYER &&
            // stopping distance === 0 serves as a proxy for "is a melee weapon"
            this.attackTarget.weapon?.getStoppingDistance() === 0 &&
            this.attackTarget.weapon?.isAttacking()
        ) {
            return true
        }

        return false
    }

    /**
     * @param path the path for the NPC the follow (WILL BE MODIFIED)
     */
    private followPath(
        path: Point[],
        updateData: UpdateData,
        stopWhenClose = false,
        speedMultiplier: number = 1,
        facingOverride: number = 0,
        facingOverrideAtEnd: number = undefined
    ) {
        const nextPt = path[0]
        const nextTile = pixelPtToTilePt(nextPt)

        // TODO: We should revisit this implementation for path shifting. It results in NPCs getting stuck on corners.
        // Maybe we can check if the current point is in between path[0] and path[1]?
        const isCloseEnough = this._dude.standingPosition.distanceTo(nextPt) < 8

        // Make them face the right direction when traveling straight up/down
        if (facingOverride === 0 && path.length > 1 && nextTile.x === this._dude.tile.x) {
            facingOverride = path[1].x - this._dude.standingPosition.x
        }

        if (isCloseEnough && stopWhenClose) {
            this._dude.move(
                updateData.elapsedTimeMillis,
                Point.ZERO,
                facingOverrideAtEnd ?? facingOverride
            )
        } else {
            const oldPosition = this._dude.standingPosition
            this._dude.move(
                updateData.elapsedTimeMillis,
                nextPt.minus(this._dude.standingPosition),
                facingOverride,
                speedMultiplier
            )
            if (!this._dude.standingPosition.equals(oldPosition)) {
                this.lastMoveTime = Date.now()
            }
        }

        if (isCloseEnough) {
            path.shift()
        }
    }

    private lastMoveTime: number
    private stuck() {
        return Date.now() - this.lastMoveTime > 1000
    }

    /**
     * Called on a regular interval (every few seconds)
     * Updates cached tasks, attack targets, etc
     */
    decideWhatToDoNext() {
        this.enemiesPresent = this.checkForEnemies()
        if (!this.enemiesPresent) {
            this.task = this.getScheduledTask()
        }
    }

    /**
     * @returns true if an enemy is encountered
     */
    private checkForEnemies(): boolean {
        let target: Dude

        if (
            this._dude.lastAttacker?.isAlive &&
            this.isEnemyFn(this._dude.lastAttacker) &&
            this._dude.lastAttacker.standingPosition.distanceTo(this._dude.standingPosition) <
                this.findTargetRange
        ) {
            console.log("just got attacked")
            target = this._dude.lastAttacker
            if (!this._dude.weapon) {
                // should flee instead
                return true
            }
        } else {
            let enemies = here()
                .getDudes()
                .filter((d) => d.isAlive)
                .filter(this.isEnemyFn)
                .filter(
                    (d) =>
                        d.standingPosition.distanceTo(this._dude.standingPosition) <
                        this.findTargetRange
                )

            if (enemies.length === 0) {
                return false
            }
            if (!this._dude.weapon) {
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
                    d.standingPosition.distanceTo(this._dude.standingPosition)
                )
            }
        }

        if (!!target) {
            let shouldComputePath = true

            if (target === this.attackTarget && !!this.targetPath && this.targetPath.length > 0) {
                // We're already tracking this target. Only update the path if they have gotten closer,
                // otherwise the attack() function will automatically extend the path.
                if (this.targetPath.length <= this._dude.tile.manhattanDistanceTo(target.tile)) {
                    shouldComputePath = false
                }
            }

            if (this.stuck()) {
                this._dude.log("stuck")
                shouldComputePath = true
            }

            if (shouldComputePath) {
                this.targetPath = this.findPathToAttackTarget(target)
            }

            this.attackTarget = target
            this.syncData.t = target.uuid
        }

        return !!target
    }

    private forceMoveToTilePosition(pt: Point) {
        const pos = this.tilePtToStandingPos(pt)
        this._dude.moveTo(pos, true)
    }

    private findPathToAttackTarget(target: Dude) {
        let targetTile = target.tile
        if (here().isOccupied(targetTile)) {
            // If attacktarget is standing in an occupied cell (eg inside a chest)
            // then the NPC will probably get stuck
            const pxCenter = target.tile.plus(pt(0.5)).times(TILE_SIZE)
            const betterChoices = [
                pxCenter.plusX(TILE_SIZE),
                pxCenter.plusX(-TILE_SIZE),
                pxCenter.plusY(TILE_SIZE),
                pxCenter.plusY(-TILE_SIZE),
            ]
            targetTile = pixelPtToTilePt(
                Lists.minBy(betterChoices, (c) => c.distanceTo(target.standingPosition))
            )
        }
        return this.findPath(targetTile)
    }

    private getTileCost(tile: Point) {
        const location = here()
        const ground = location.getGround(tile)
        const type = ground?.type
        if (
            type === GroundType.LEDGE ||
            Ground.isWater(type) ||
            // don't encourage being off the map
            !ground
        ) {
            return 3
        }
        const element = location.getElement(tile)
        if (element?.type === ElementType.BLACKBERRIES) {
            return 10
        }
        // TODO: Maybe add a fun fireproof enemy in the future :)
        if (
            element?.entity?.getComponent(Burnable)?.isBurningAt(tile) ||
            (element?.type === ElementType.CAMPFIRE &&
                element.entity.getComponent(Campfire).isBurning)
        ) {
            return 20
        }
        return 1
    }

    isNicelyWalkable(tile: Point) {
        return this.getTileCost(tile) === 1
    }

    private findPath(targetTilePoint: Point) {
        // TODO: NPCs can sometimes get stuck if their starting square is "occupied"
        const path = here().findPath(
            this._dude.tile,
            targetTilePoint,
            this.pathFindingHeuristic,
            this.extraPathIsOccupiedFilter,
            (_, nextSquare) => this.getTileCost(nextSquare)
        )

        if (!path) {
            return undefined
        }

        for (let i = 1; i < path.length - 1; i++) {
            const pt = path[i]
            const before = path[i - 1]
            const after = path[i + 1]
            if (
                (before.x === pt.x && pt.x === after.x) ||
                (before.y === pt.y && pt.y === after.y)
            ) {
                path.splice(i, 1)
                i--
            }
        }

        // slice(1) because we don't need the start in the path
        return path.map((pt) => this.tilePtToStandingPos(pt)).slice(1)
    }

    private goToLocation(updateData: UpdateData, goalLocation: Location) {
        const nextLocation = this.getNextLocation(goalLocation)
        this.findTeleporter(nextLocation.uuid)
        this.goToTeleporter(updateData, 0.5)
    }

    private simulateGoToLocation(goalLocation: Location) {
        const nextLocation = this.getNextLocation(goalLocation)
        this.teleporterTarget = LocationManager.instance.findTeleporter(
            this.dude.location.uuid,
            nextLocation.uuid
        )
        this.useTeleporter()
    }

    private getNextLocation(goalLocation: Location) {
        // For now, we're lazy about this and assume every linked location is
        // at most 1 off from the exterior, so we can avoid doing pathfinding
        if (this._dude.location === camp()) {
            return goalLocation
        } else {
            return camp()
        }
    }

    private teleporterTarget: ReturnType<LocationManager["findTeleporter"]>
    private findTeleporter(uuid: string) {
        if (this.teleporterTarget?.dest.location !== uuid) {
            this.teleporterTarget = LocationManager.instance.findTeleporter(
                this.dude.location.uuid,
                uuid
            )
        }
    }
    private goToTeleporter(updateData: UpdateData, speedMultiplier: number = 1) {
        if (!this.teleporterTarget) {
            return
        }
        const tilePt = pixelPtToTilePt(this.teleporterTarget.source.pos)
        this.walkTo(tilePt, updateData, { speedMultiplier })
        if (this._dude.tile.manhattanDistanceTo(tilePt) <= 1) {
            this.useTeleporter()
        }
    }
    private useTeleporter() {
        if (!this.teleporterTarget) {
            return
        }
        LocationManager.instance.npcUseTeleporter(this._dude, this.teleporterTarget.id)
        this.clearExistingAIState()
    }
    private tilePtToStandingPos(tilePt: Point) {
        const ptOffset = new Point(0.5, 0.8)
        return tilePt.plus(ptOffset).times(TILE_SIZE)
    }

    private leader: Dude
    getLeader() {
        const savedLeaderUUID = this._dude.blob["leader"]
        if (!savedLeaderUUID) {
            return undefined
        }
        if (!this.leader) {
            this.leader = Dude.get(savedLeaderUUID)
        }
        return this.leader
    }
    setLeader(val?: Dude) {
        this.leader = val
        this._dude.blob["leader"] = val?.uuid
    }

    getRenderMethods() {
        if (!debug.showPathfinding) {
            return []
        } else if (this.targetPath) {
            return this.renderPath(this.targetPath)
        } else if (this.walkPath) {
            return this.renderPath(this.walkPath)
        } else if (this.roamPath) {
            return this.renderPath(this.roamPath)
        }
        return []
    }

    private renderPath(path: Point[], color: string = "#ff0000") {
        if (path.length === 0) {
            return []
        }
        let lineStart = this.tilePtToStandingPos(pixelPtToTilePt(this._dude.standingPosition))
        const result = []
        for (let i = 0; i < path.length; i++) {
            const lineEnd = path[i]
            result.push(new LineRender(lineStart, lineEnd, color))
            lineStart = lineEnd
        }
        return result
    }
}
