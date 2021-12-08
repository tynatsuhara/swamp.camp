import { BoxCollider } from "brigsby/dist/collision/BoxCollider"
import { Component } from "brigsby/dist/Component"
import { debug } from "brigsby/dist/Debug"
import { UpdateData } from "brigsby/dist/Engine"
import { Point } from "brigsby/dist/Point"
import { RenderMethod } from "brigsby/dist/renderer/RenderMethod"
import { AnimatedSpriteComponent } from "brigsby/dist/sprites/AnimatedSpriteComponent"
import { SpriteTransform } from "brigsby/dist/sprites/SpriteTransform"
import { StaticSpriteSource } from "brigsby/dist/sprites/StaticSpriteSource"
import { Animator } from "brigsby/dist/util/Animator"
import { Lists } from "brigsby/dist/util/Lists"
import { RepeatedInvoker } from "brigsby/dist/util/RepeatedInvoker"
import { StepSounds } from "../audio/StepSounds"
import { CutsceneManager } from "../cutscenes/CutsceneManager"
import { DeathCutscene } from "../cutscenes/DeathCutscene"
import { IntroCutscene } from "../cutscenes/IntroCutscene"
import { FireParticles } from "../graphics/FireParticles"
import { ImageFilters } from "../graphics/ImageFilters"
import { pixelPtToTilePt, TILE_SIZE } from "../graphics/Tilesets"
import { WalkingParticles } from "../graphics/WalkingParticles"
import { Inventory } from "../items/Inventory"
import { Item, spawnItem } from "../items/Items"
import { DudeSaveState } from "../saves/DudeSaveState"
import { DialogueDisplay } from "../ui/DialogueDisplay"
import { DudeInteractIndicator } from "../ui/DudeInteractIndicator"
import { HUD } from "../ui/HUD"
import { NotificationDisplay } from "../ui/NotificationDisplay"
import { UIStateManager } from "../ui/UIStateManager"
import { Campfire } from "../world/elements/Campfire"
import { ElementType } from "../world/elements/Elements"
import { Interactable } from "../world/elements/Interactable"
import { Ground, GroundType } from "../world/ground/Ground"
import { LightManager } from "../world/LightManager"
import { Location } from "../world/Location"
import { camp, LocationManager } from "../world/LocationManager"
import { Residence } from "../world/residences/Residence"
import { WorldTime } from "../world/WorldTime"
import { ActiveCondition, Condition } from "./Condition"
import { DialogueSource, EMPTY_DIALOGUE, getDialogue } from "./dialogue/Dialogue"
import { DudeAnimationUtils } from "./DudeAnimationUtils"
import { DudeFaction, DudeType } from "./DudeFactory"
import { NPC } from "./NPC"
import { Shield } from "./weapons/Shield"
import { ShieldFactory } from "./weapons/ShieldFactory"
import { ShieldType } from "./weapons/ShieldType"
import { Weapon } from "./weapons/Weapon"
import { WeaponFactory } from "./weapons/WeaponFactory"
import { WeaponType } from "./weapons/WeaponType"

export class Dude extends Component implements DialogueSource {
    static readonly PLAYER_COLLISION_LAYER = "playa"
    static readonly NPC_COLLISION_LAYER = "npc"

    // managed by WorldLocation/LocationManager classes
    location: Location

    blob: object
    readonly uuid: string
    readonly type: DudeType
    readonly factions: DudeFaction[]
    readonly inventory: Inventory
    maxHealth: number
    private _health: number
    get health() {
        return this._health
    }
    speed: number
    private characterAnimName: string
    private _animation: AnimatedSpriteComponent
    get animation() {
        return this._animation
    }

    private _weapon: Weapon
    get weapon() {
        return this._weapon
    }
    get weaponType() {
        return this.weapon?.getType() ?? WeaponType.NONE
    }
    private _shield: Shield
    get shield() {
        return this._shield
    }
    get shieldType() {
        return this.shield?.type ?? ShieldType.NONE
    }

    private collider: BoxCollider
    private relativeColliderPos: Point = new Point(3, 15)
    get colliderSize() {
        return this.collider.dimensions
    }

    private _position: Point
    get position(): Point {
        return this._position
    }
    // bottom center of the tile
    get standingPosition(): Point {
        return this.position.plus(
            new Point(
                this.animation.transform.dimensions.x / 2,
                this.animation.transform.dimensions.y
            )
        )
    }
    get tile(): Point {
        return pixelPtToTilePt(this.standingPosition)
    }
    private _isMoving: boolean
    get isMoving() {
        return this._isMoving
    }

    private dialogueInteract: Interactable
    dialogue: string

    private conditions: ActiveCondition[] = []

    constructor(
        uuid: string,
        hasPendingSlot: boolean,
        type: DudeType,
        factions: DudeFaction[],
        characterAnimName: string,
        position: Point,
        weaponType: WeaponType,
        shieldType: ShieldType,
        maxHealth: number,
        health: number,
        speed: number,
        inventory: Inventory,
        dialogue: string,
        blob: object,
        colliderSize: Point,
        conditions: ActiveCondition[]
    ) {
        super()
        this.uuid = uuid
        this.type = type
        this.factions = factions
        this._position = position
        this.maxHealth = maxHealth
        this._health = maxHealth === Number.MAX_SAFE_INTEGER ? Number.MAX_SAFE_INTEGER : health
        this.speed = speed
        this.inventory = inventory
        this.dialogue = dialogue
        this.blob = blob
        this.conditions = conditions

        this.awake = () => {
            // Set up animations
            this.characterAnimName = characterAnimName
            const idleAnim = DudeAnimationUtils.getCharacterIdleAnimation(characterAnimName, blob)
            const runAnim = DudeAnimationUtils.getCharacterWalkAnimation(characterAnimName, blob)
            const jumpAnim = DudeAnimationUtils.getCharacterJumpAnimation(characterAnimName, blob)
            const height = idleAnim.getSprite(0).dimensions.y
            this._animation = this.entity.addComponent(
                new AnimatedSpriteComponent(
                    [idleAnim, runAnim, jumpAnim],
                    new SpriteTransform(new Point(0, 28 - height))
                )
            )
            this._animation.fastForward(Math.random() * 1000) // so not all the animations sync up

            this.setWeapon(weaponType)
            this.setShield(shieldType)

            this.entity.addComponent(new WalkingParticles())

            // Set up collider
            this.relativeColliderPos = new Point(
                this.animation.transform.dimensions.x / 2 - colliderSize.x / 2,
                this.animation.transform.dimensions.y - colliderSize.y
            )
            this.collider = this.entity.addComponent(
                new BoxCollider(
                    this.position.plus(this.relativeColliderPos),
                    colliderSize,
                    this.type === DudeType.PLAYER
                        ? Dude.PLAYER_COLLISION_LAYER
                        : Dude.NPC_COLLISION_LAYER
                )
            )

            this.dialogueInteract = this.entity.addComponent(
                new Interactable(
                    new Point(0, 0),
                    () => DialogueDisplay.instance.startDialogue(this),
                    Point.ZERO,
                    () =>
                        !UIStateManager.instance.isMenuOpen &&
                        !!this.dialogue &&
                        this.entity.getComponent(NPC)?.canTalk()
                )
            )

            StepSounds.startFootstepSoundLoop(this)
        }

        this.start = () => {
            this.seaLevel = this.location.levels?.get(this.tile) ?? 0
            this.claimResidence(type, uuid, hasPendingSlot)
        }
    }

    update(updateData: UpdateData) {
        this.animation.transform.depth = this.collider.position.y + this.collider.dimensions.y

        // All other transforms (eg the weapon) are positioned relative to the animation
        this.animation.transform.position = this.position
        if (this.layingDownOffset) {
            this.animation.transform.position = this.animation.transform.position.plus(
                this.layingDownOffset
            )
        } else if (this.isRolling && this.animation.transform.rotation !== 0) {
            this.animation.transform.position = this.animation.transform.position.plus(
                this.rollingOffset
            )
        } else if (this.isJumping) {
            this.animation.transform.position = this.animation.transform.position.plusY(
                -this.jumpingOffset || 0
            )
        }

        if (!!this.dialogueInteract) {
            this.dialogueInteract.position = this.standingPosition.minus(new Point(0, 5))
            this.dialogueInteract.uiOffset = new Point(0, -TILE_SIZE * 1.5).plus(
                this.getAnimationOffsetPosition()
            )
            this.dialogueInteract.enabled =
                this.dialogue !== EMPTY_DIALOGUE && DialogueDisplay.instance.source !== this
        }

        this.updateActiveConditions()

        this.jumpingAnimator?.update(updateData.elapsedTimeMillis)
    }

    equipFirstWeaponInInventory() {
        const weapon = this.inventory
            .getStacks()
            .map((stack) => WeaponType[WeaponType[stack.item]] as WeaponType)
            .find((w) => !!w)
        this.setWeapon(weapon || WeaponType.NONE)
    }

    equipFirstShieldInInventory() {
        const shield = this.inventory
            .getStacks()
            .map((stack) => ShieldType[ShieldType[stack.item]])
            .find((s) => !!s)
        this.setShield(shield || ShieldType.NONE)
    }

    setWeapon(type: WeaponType) {
        this.weapon?.delete()
        this._weapon = this.entity.addComponent(WeaponFactory.make(type, this.type))
    }

    setShield(type: ShieldType) {
        this.shield?.delete()
        this._shield = this.entity.addComponent(ShieldFactory.make(type))
    }

    private fireParticles: FireParticles

    updateActiveConditions() {
        if (this.conditions.length === 0) {
            return
        }

        this.conditions.forEach((c) => {
            const timeSinceLastExec = WorldTime.instance.time - c.lastExec

            if (c.expiration < WorldTime.instance.time) {
                this.removeCondition(c.condition)
                return
            }

            // TODO: add condition effects
            switch (c.condition) {
                case Condition.ON_FIRE:
                    if (!this.fireParticles) {
                        this.fireParticles = this.entity.addComponent(
                            new FireParticles(
                                this.colliderSize.x - 4,
                                () =>
                                    this.standingPosition
                                        .plusY(-8)
                                        .plus(this.getAnimationOffsetPosition()),
                                () => this.animation.transform.depth + 1
                            )
                        )
                    }
                    LightManager.instance.addLight(
                        LocationManager.instance.currentLocation,
                        this.fireParticles,
                        this.standingPosition
                            .plusY(-TILE_SIZE / 2)
                            .plus(this.getAnimationOffsetPosition()),
                        40
                    )
                    if (timeSinceLastExec > 500) {
                        const fireDamage = 0.3
                        this.damage(fireDamage, {
                            blockable: false,
                            dodgeable: false,
                        })
                        c.lastExec = WorldTime.instance.time
                    }
                    return
                case Condition.POISONED:
                    if (timeSinceLastExec > 500) {
                        const poisonDamage = 0.25
                        this.damage(poisonDamage, {
                            blockable: false,
                            dodgeable: false,
                        })
                        c.lastExec = WorldTime.instance.time
                    }
                    return
            }
        })
    }

    addCondition(condition: Condition, duration: number) {
        const expiration = WorldTime.instance.time + duration
        const existing = this.conditions.find((c) => c.condition === condition)
        if (existing) {
            existing.expiration = Math.max(existing.expiration, expiration)
        } else {
            this.conditions.push({
                condition,
                expiration,
                lastExec: -1,
            })
        }
    }

    removeCondition(condition: Condition) {
        this.conditions = this.conditions.filter((c) => c.condition !== condition)
        switch (condition) {
            case Condition.ON_FIRE:
                if (this.fireParticles) {
                    this.entity.removeComponent(this.fireParticles)
                    LightManager.instance.removeLight(this.fireParticles)
                    this.fireParticles = undefined
                }
                return
        }
    }

    hasCondition(condition: Condition) {
        return this.conditions.some((c) => c.condition === condition)
    }

    get isAlive() {
        return this._health > 0
    }

    damage(
        damage: number,
        {
            direction = Point.ZERO,
            knockback = 0,
            attacker = undefined,
            blockable = true,
            dodgeable = true,
        }: {
            direction?: Point
            knockback?: number
            attacker?: Dude
            blockable?: boolean
            dodgeable?: boolean
        }
    ) {
        if (dodgeable && (this.rolling || this.jumping)) {
            return
        }

        if (!this.isAlive) {
            return
        }

        const blocked =
            blockable &&
            this.shield?.isBlocking() &&
            // absorb damage if facing the direction of the enemy
            !this.isFacing(this.standingPosition.plus(direction))

        if (blocked) {
            damage *= 0.25
            knockback *= 0.4
        }

        if (this.isAlive) {
            if (
                (this.type === DudeType.PLAYER && debug.godMode) ||
                this.maxHealth === Number.MAX_SAFE_INTEGER
            ) {
                damage = 0
            }
            this._health -= damage
            if (!this.isAlive) {
                this.die(direction)
                knockback *= 1 + Math.random()
            }
        }

        if (knockback > 0) {
            this.knockback(direction, knockback)
        }

        if (!!this.onDamageCallback) {
            this.onDamageCallback(blocked)
        }

        if (attacker) {
            this.lastAttacker = attacker
            this.lastAttackerTime = WorldTime.instance.time
        }
    }
    lastAttacker: Dude
    lastAttackerTime: number

    private onDamageCallback: (blocked: boolean) => void
    setOnDamageCallback(fn: (blocked: boolean) => void) {
        this.onDamageCallback = fn
    }

    droppedItemSupplier: () => Item[] = () => [Item.COIN]
    private layingDownOffset: Point

    die(direction: Point = new Point(-1, 0)) {
        this._health = 0

        // position the body
        const prePos = this.animation.transform.position
        this.animation.transform.rotate(
            90 * (direction.x >= 0 ? 1 : -1),
            this.standingPosition.plusY(-5)
        )
        this.layingDownOffset = this.animation.transform.position.minus(prePos)
        this.animation.goToAnimation(0)
        this.animation.pause()

        // spawn items
        const items = this.droppedItemSupplier()
        items.forEach((item) => {
            const randomness = 8
            const velocity = direction
                .normalized()
                .plus(new Point(Math.random() - 0.5, Math.random() - 0.5).times(randomness))
            setTimeout(
                () =>
                    spawnItem(
                        this.standingPosition.minus(new Point(0, 2)),
                        item,
                        velocity,
                        this.collider
                    ),
                100
            )
        })
        this.dropWeapon()

        // remove the body
        setTimeout(() => {
            if (!this.factions.includes(DudeFaction.VILLAGERS)) {
                this.dissolve()
            }
            if (this.type !== DudeType.PLAYER) {
                this.collider.enabled = false
            }
        }, 1000)

        this.triggerDeathHooks()
    }

    private triggerDeathHooks() {
        // play death cutscene if applicable
        if (this.type === DudeType.PLAYER) {
            if (CutsceneManager.instance.isCutsceneActive(IntroCutscene)) {
                setTimeout(() => this.revive(), 1000 + Math.random() * 1000)
            } else {
                CutsceneManager.instance.startCutscene(new DeathCutscene())
            }
        } else if (this.factions.includes(DudeFaction.VILLAGERS)) {
            // If they have a home, mark it as vacant
            this.location
                .getElements()
                .flatMap((e) => e.entity.getComponents(Residence))
                .filter((residence) => residence?.isHomeOf(this.uuid))
                .forEach((residence) => residence.evictResident(this.uuid))

            NotificationDisplay.instance.push({
                text: "Villager killed",
                icon: "skull1",
            })
        }
    }

    revive() {
        this._health = this.maxHealth * 0.25

        // stand up
        this.animation.transform.rotation = 0
        this.layingDownOffset = null

        this.conditions.forEach((c) => this.removeCondition(c.condition))
    }

    dissolve() {
        let dissolveChance = 0.1
        const interval = setInterval(() => {
            this.animation.applyFilter(ImageFilters.dissolve(() => dissolveChance))
            this.animation.goToAnimation(0) // refresh even though it's paused
            if (dissolveChance >= 1) {
                this.entity?.selfDestruct()
                clearInterval(interval)
            }
            dissolveChance *= 2
        }, 200)
    }

    private dropWeapon() {
        // TODO
    }

    private knockIntervalCallback: number = 0
    knockback(direction: Point, knockback: number) {
        if (this.knockIntervalCallback !== 0) {
            window.cancelAnimationFrame(this.knockIntervalCallback)
        }

        const goal = this.position.plus(direction.normalized().times(knockback))
        const distToStop = 2
        let intervalsRemaining = 50

        let last = new Date().getTime()
        const knock = () => {
            const now = new Date().getTime()
            const diff = now - last
            if (diff > 0) {
                this.moveTo(this.position.lerp((0.15 * diff) / 30, goal))
            }
            intervalsRemaining--
            if (intervalsRemaining === 0 || goal.minus(this.position).magnitude() < distToStop) {
                this.knockIntervalCallback = 0
            } else {
                this.knockIntervalCallback = requestAnimationFrame(knock)
            }
            last = now
        }
        this.knockIntervalCallback = requestAnimationFrame(knock)
    }

    heal(amount: number) {
        if (this.isAlive) {
            this._health = Math.min(this.maxHealth, this.health + amount)
        }
    }

    /**
     * Should be called on EVERY update step for
     * @param updateData
     * @param direction the direction they are moving in, will be normalized by this code
     * @param facingOverride if < 0, will face left, if > 0, will face right. if == 0, will face the direction they're moving
     */
    move(
        updateData: UpdateData,
        direction: Point,
        facingOverride: number = 0,
        speedMultiplier: number = 1
    ) {
        if (this._health <= 0) {
            return
        }

        if (this.knockIntervalCallback !== 0) {
            // being knocked back, don't let em walk
            direction = Point.ZERO
        }

        if ((direction.x < 0 && facingOverride === 0) || facingOverride < 0) {
            this.animation.transform.mirrorX = true
        } else if ((direction.x > 0 && facingOverride === 0) || facingOverride > 0) {
            this.animation.transform.mirrorX = false
        }

        const wasMoving = this.isMoving
        this._isMoving = direction.x !== 0 || direction.y !== 0

        // Update animations
        if (this.isMoving) {
            // start walking animation
            // TODO make the run animation backwards if they run backwards :)
            if (!wasMoving || this.animationDirty) {
                this.animation.goToAnimation(1)
            }
        } else if (wasMoving || this.animationDirty) {
            // start idle animation
            this.animation.goToAnimation(0)
        }

        const standingTilePos = pixelPtToTilePt(this.standingPosition)
        const ground = this.location.getGround(standingTilePos)
        const element = this.location.getElement(standingTilePos)

        if (Ground.isWater(ground?.type)) {
            this.removeCondition(Condition.ON_FIRE)

            if (this.factions.includes(DudeFaction.AQUATIC)) {
                // don't affect speed
            } else if (!this.isJumping) {
                speedMultiplier *= 0.4
            }
        } else if (
            !this.isJumping &&
            element?.type === ElementType.CAMPFIRE &&
            element.entity.getComponent(Campfire).logs > 0 &&
            this.standingPosition.distanceTo(
                standingTilePos.times(TILE_SIZE).plus(new Point(8, 10))
            ) < 5
        ) {
            this.addCondition(Condition.ON_FIRE, 1000 + Math.random() * 1000)
        }

        const verticalMovement = this.getVerticalMovement(updateData)
        if (verticalMovement.y < 0) {
            // climbing uphill takes effort
            speedMultiplier = 0
        }

        const walkDistance = updateData.elapsedTimeMillis * this.speed * speedMultiplier
        const walkMovement = this.isMoving ? direction.normalized().times(walkDistance) : Point.ZERO
        const standingPosAfterWalk = this.standingPosition.plus(walkMovement)

        // Prevent buggy positioning near a ledge
        const depthAfterWalk = this.getLevelAt(standingPosAfterWalk)
        const depthAfterVerticalMove = this.getLevelAt(standingPosAfterWalk.plus(verticalMovement))
        let totalMovement: Point
        if (depthAfterWalk === depthAfterVerticalMove) {
            totalMovement = walkMovement.plus(verticalMovement)
        } else {
            totalMovement = walkMovement
        }

        if (totalMovement.x !== 0 || totalMovement.y !== 0) {
            const newPos = this._position.plus(totalMovement)
            this.moveTo(newPos)
        }

        this.animationDirty = false
    }

    private seaLevel: number // matches the scale of WorldLocation.levels

    private getLevelAt(pos: Point) {
        const tilePos = pixelPtToTilePt(pos)
        const currentLevel = this.location.levels?.get(tilePos) ?? 0
        const ground = this.location.getGround(tilePos)
        if (ground?.type === GroundType.WATER) {
            return currentLevel - 1
        }
        return currentLevel
    }

    private getVerticalMovement(updateData: UpdateData) {
        let dx = 0
        let dy = 0
        if (dx == NaN || dy == NaN) {
            this.log("what the fuck")
        }

        const fallSpeedY = 0.0075
        const climbSpeed = 0.005
        const pixelHeightBetweenLevels = 10 // the distance between levels

        const goalLevel = this.getLevelAt(this.standingPosition)

        // if (ground?.type === GroundType.LEDGE) {
        //     if (levels.get(standingTilePos.plusY(1)) < currentLevel && moveDirection.y >= 0) {
        //         // falling downhill
        //         speed = fallSpeedY
        //         goalLevel = currentLevel - 1
        //     } else if (levels.get(standingTilePos.plusY(-1)) < currentLevel && moveDirection.y < 0) {
        //         // climbing uphill
        //         speed = climbSpeed
        //         goalLevel = currentLevel + 1
        //     }
        // }

        if (goalLevel < this.seaLevel) {
            const speed = fallSpeedY * updateData.elapsedTimeMillis
            const levelDiff = this.seaLevel - goalLevel
            const distanceWillMove = Math.min(speed, levelDiff)
            this.seaLevel = this.seaLevel - distanceWillMove
            dy = distanceWillMove * pixelHeightBetweenLevels
        } else if (goalLevel > this.seaLevel) {
            const speed = climbSpeed * updateData.elapsedTimeMillis
            const levelDiff = goalLevel - this.seaLevel
            const distanceWillMove = Math.min(speed, levelDiff)
            this.seaLevel = this.seaLevel + distanceWillMove
            dy = -distanceWillMove * pixelHeightBetweenLevels
        }

        return new Point(dx, dy)
    }

    /**
     * @param point World point where the dude will be moved, unless they hit a collider (with skipColliderCheck = false)
     */
    moveTo(point: Point, skipColliderCheck = false) {
        const moveFn = skipColliderCheck
            ? (pos: Point) => this.collider.forceSetPosition(pos)
            : (pos: Point) => this.collider.moveTo(pos)
        this._position = moveFn(point.plus(this.relativeColliderPos)).minus(
            this.relativeColliderPos
        )
        if (skipColliderCheck) {
            this.seaLevel = this.location.levels?.get(this.tile) ?? 0
        }
    }

    private animationDirty: boolean

    private isRolling = false
    private canJumpOrRoll = true // jumping cooldown
    private rollingOffset: Point

    private isJumping = false
    private jumpingAnimator: Animator
    private jumpingOffset: number

    roll() {
        const ground = this.location.getGround(this.tile)
        if (!this.canJumpOrRoll || Ground.isWater(ground?.type)) {
            return
        }
        this.canJumpOrRoll = false
        this.doRoll()
        setTimeout(() => (this.canJumpOrRoll = true), 750)
    }

    get rolling() {
        return this.isRolling
    }

    // has a rolling animation, however janky
    private doRoll() {
        const setRotation = (rot: number, offset: Point) => {
            if (this.animation.transform.mirrorX) {
                this.animation.transform.rotation = -rot
                this.rollingOffset = new Point(-offset.x, offset.y)
            } else {
                this.animation.transform.rotation = rot
                this.rollingOffset = offset
            }
        }

        const animationSpeed = 40
        this.isRolling = true
        this.canJumpOrRoll = false

        setRotation(45, new Point(6, 8))
        const rotations = [90, 180, 225, , 270, 315]
        rotations.forEach((r, i) =>
            setTimeout(() => setRotation(r, new Point(0, 14)), animationSpeed * (i + 1))
        )
        setTimeout(() => {
            setRotation(0, Point.ZERO)
            this.isRolling = false
        }, animationSpeed * (rotations.length + 1))
    }

    jump() {
        const ground = this.location.getGround(this.tile)
        if (!this.canJumpOrRoll || Ground.isWater(ground?.type)) {
            return
        }
        this.canJumpOrRoll = false
        this.doJump()
        setTimeout(() => (this.canJumpOrRoll = true), 750)
    }

    get jumping() {
        return this.isJumping
    }

    // just a stepping dodge instead of a roll
    private doJump() {
        StepSounds.singleFootstepSound(this, 2)
        this.isJumping = true
        this.animation.goToAnimation(2)
        const frames = [3, 8, 11, 12, 13, 14, 12, 9, 3]
        this.jumpingAnimator = new Animator(
            Lists.repeat(frames.length, [40]),
            (i) => (this.jumpingOffset = frames[i]),
            () => {
                StepSounds.singleFootstepSound(this, 3)
                this.isJumping = false
                this.animationDirty = true
                this.jumpingAnimator = undefined
                this.jumpingOffset = undefined
            }
        )
    }

    // fn will execute immediately and every intervalMillis milliseconds
    // until the NPC is dead or the function returns true
    doWhileLiving(fn: () => boolean | void, intervalMillis: number) {
        if (!this.isAlive) {
            return
        }

        if (fn()) {
            return
        }

        const invoker = this.entity.addComponent(
            new RepeatedInvoker(() => {
                if (!this.isAlive || fn()) {
                    invoker.delete()
                }
                return intervalMillis
            }, intervalMillis)
        )
    }

    /**
     * Returns true if these dudes have no factions in common
     */
    isEnemy(d: Dude) {
        return !d.factions.some((fac) => this.factions.includes(fac))
    }

    isFacing(pt: Point) {
        if (pt.x === this.standingPosition.x) {
            return true
        }
        return this.animation.transform.mirrorX === pt.x < this.standingPosition.x
    }

    facingMultipler() {
        return this.animation.transform.mirrorX ? -1 : 1
    }

    getAnimationOffsetPosition(): Point {
        if (this.isJumping) {
            return new Point(0, -5)
        }

        // magic based on the animations
        const f = this.animation.currentFrame()
        let arr: number[]
        if (!this.isMoving) {
            arr = [0, 1, 2, 1]
        } else {
            arr = [-1, -2, -1, 0]
        }
        return new Point(0, arr[f])
    }

    save(): DudeSaveState {
        return {
            uuid: this.uuid,
            type: this.type,
            pos: this.position.toString(),
            anim: this.characterAnimName,
            maxHealth: this.maxHealth,
            health: this._health,
            speed: this.speed,
            weapon: this.weaponType,
            shield: this.shieldType,
            inventory: this.inventory.save(),
            dialogue: this.dialogue,
            blob: this.blob,
            conditions: this.conditions,
        }
    }

    getRenderMethods(): RenderMethod[] {
        return this.getIndicator()
    }

    delete() {
        this.location.dudes.delete(this)
        super.delete()
    }

    private claimResidence(type: DudeType, uuid: string, hasPendingSlot: boolean) {
        if (!this.factions.includes(DudeFaction.VILLAGERS)) {
            return
        }

        const residences = camp()
            .getElements()
            .flatMap((e) => e.entity.getComponents(Residence))
            .filter((e) => !!e)

        const hasResidence = residences.some((residence) => residence.isHomeOf(uuid))

        if (hasResidence) {
            return
        }

        if (hasPendingSlot) {
            const pending = residences.filter((res) => res.canClaimPendingSlot(type))
            if (pending.length > 0) {
                pending[0].claimPendingSlot(uuid)
            }
            return
        }

        // Probably spawned via dev controls
        const availableResidences = residences.filter((res) => res.hasCapacity(type))
        if (availableResidences.length > 0) {
            availableResidences[0].setResidentPending()
            availableResidences[0].claimPendingSlot(uuid)
        }
    }

    private getIndicator(): RenderMethod[] {
        let indicator = DudeInteractIndicator.NONE
        if (!this.isAlive) {
            return []
        }

        // little flashing circle right before attacking the player
        const npcAttackIndicator = this.entity.getComponent(NPC)?.attackIndicator
        if (!!npcAttackIndicator) {
            indicator = npcAttackIndicator
        } else if (!!this.dialogue && this.dialogue != EMPTY_DIALOGUE) {
            indicator = getDialogue(this.dialogue).indicator
        }

        // if (
        //     this.factions.includes(DudeFaction.VILLAGERS) &&
        //     WorldTime.instance.time < this.lastAttackerTime + 10_000
        // ) {
        //     indicator = DudeInteractIndicator.IMPORTANT_DIALOGUE
        // }

        if (indicator === DudeInteractIndicator.IMPORTANT_DIALOGUE) {
            // update off screen indicator
            HUD.instance.addIndicator(this, () => this.standingPosition)
        } else {
            HUD.instance.removeIndicator(this)
        }

        // render indicator icon overhead
        let tile: StaticSpriteSource = DudeInteractIndicator.getTile(indicator)
        if (
            !tile ||
            this.dialogueInteract?.isShowingUI ||
            DialogueDisplay.instance.source === this
        ) {
            return []
        } else {
            return [
                tile.toImageRender(
                    new SpriteTransform(
                        this.standingPosition
                            .plusY(-28)
                            .plus(new Point(1, 1).times(-TILE_SIZE / 2))
                            .plus(this.getAnimationOffsetPosition()),
                        new Point(TILE_SIZE, TILE_SIZE),
                        0,
                        false,
                        false,
                        UIStateManager.UI_SPRITE_DEPTH
                    )
                ),
            ]
        }
    }

    log(message: any) {
        console.log(`${DudeType[this.type]}: ${message}`)
    }
}
