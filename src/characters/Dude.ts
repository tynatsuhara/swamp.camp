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
import { controls } from "../Controls"
import { CutsceneManager } from "../cutscenes/CutsceneManager"
import { CutscenePlayerController } from "../cutscenes/CutscenePlayerController"
import { DeathCutscene } from "../cutscenes/DeathCutscene"
import { IntroCutscene } from "../cutscenes/IntroCutscene"
import { BlackLungParticles } from "../graphics/BlackLungParticles"
import { FireParticles } from "../graphics/FireParticles"
import { ImageFilters } from "../graphics/ImageFilters"
import { PoisonParticles } from "../graphics/PoisonParticles"
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
import { Pushable } from "../world/elements/Pushable"
import { Ground, GroundType } from "../world/ground/Ground"
import { LightManager } from "../world/LightManager"
import { Location } from "../world/Location"
import { camp, here } from "../world/LocationManager"
import { Residence } from "../world/residences/Residence"
import { WorldTime } from "../world/WorldTime"
import { ActiveCondition, Condition } from "./Condition"
import { DialogueSource, EMPTY_DIALOGUE, getDialogue } from "./dialogue/Dialogue"
import { DudeAnimationUtils } from "./DudeAnimationUtils"
import { DudeFaction, DudeType } from "./DudeFactory"
import { NPC, NPCAttackState } from "./NPC"
import { Player } from "./Player"
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

    // top left corner of the sprite - externally we should only use standingPosition
    private position: Point
    private standingOffset: Point

    // bottom center of the tile
    get standingPosition(): Point {
        return this.position.plus(this.standingOffset)
    }
    get tile(): Point {
        return pixelPtToTilePt(this.standingPosition)
    }
    private _isMoving: boolean
    get isMoving() {
        return this._isMoving
    }

    // manually set a depth for the player sprite
    manualDepth = undefined

    private dialogueInteract: Interactable
    dialogue: string

    private conditions: ActiveCondition[] = []
    private name: string

    constructor(params: {
        uuid: string
        hasPendingSlot: boolean
        type: DudeType
        factions: DudeFaction[]
        characterAnimName: string
        standingPosition: Point
        weaponType: WeaponType
        shieldType: ShieldType
        maxHealth: number
        health: number
        speed: number
        inventory: Inventory
        dialogue: string
        blob: object
        colliderSize: Point
        conditions: ActiveCondition[]
        name: string
    }) {
        super()

        // Most parameters should be defined
        Object.entries(params).forEach(([key, value]) => {
            if (key === "name") {
                return
            }
            if (value === undefined || value === null) {
                console.error(`parameter ${key} should not be ${value}`)
            }
        })

        const {
            uuid,
            hasPendingSlot,
            type,
            factions,
            characterAnimName,
            standingPosition,
            weaponType,
            shieldType,
            maxHealth,
            health,
            speed,
            inventory,
            dialogue,
            blob,
            colliderSize,
            conditions,
            name,
        } = { ...params }

        this.uuid = uuid
        this.type = type
        this.factions = factions
        this.maxHealth = maxHealth
        this._health = maxHealth === Number.MAX_SAFE_INTEGER ? Number.MAX_SAFE_INTEGER : health
        this.speed = speed
        this.inventory = inventory
        this.dialogue = dialogue
        this.blob = blob
        this.conditions = conditions
        this.name = name

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
            this.standingOffset = new Point(
                this.animation.transform.dimensions.x / 2,
                this.animation.transform.dimensions.y
            )
            this.position = standingPosition.minus(this.standingOffset)
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
        this.animation.transform.depth =
            this.manualDepth ?? this.collider.position.y + this.collider.dimensions.y

        // All other transforms (eg the weapon) are positioned relative to the animation
        const transform = this.animation.transform
        transform.position = this.position

        if (this.layingDownOffset) {
            transform.position = transform.position.plus(this.layingDownOffset)
        } else if (this.isRolling && this.animation.transform.rotation !== 0) {
            transform.position = transform.position.plus(this.rollingOffset)
        } else if (this.isJumping) {
            transform.position = transform.position.plusY(-this.jumpingOffset)
        }

        if (!!this.dialogueInteract) {
            this.dialogueInteract.position = this.standingPosition.minus(new Point(0, 5))
            this.dialogueInteract.uiOffset = new Point(0, -TILE_SIZE * 1.5).plus(
                this.getAnimationOffset()
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
        if (this.weapon?.getType() === type) {
            return
        }
        this.weapon?.delete()
        this._weapon = this.entity.addComponent(WeaponFactory.make(type, this.type))
        this.shield?.setOnBack(false) // keep em in sync
    }

    setShield(type: ShieldType) {
        if (this.shield?.type === type) {
            return
        }
        this.shield?.delete()
        this._shield = this.entity.addComponent(ShieldFactory.make(type))
        this.weapon?.setSheathed(false) // keep em in sync
    }

    setWeaponAndShieldDrawn(drawn: boolean) {
        this.weapon?.setSheathed(!drawn)
        this.shield?.setOnBack(!drawn)
    }

    private fireParticles: FireParticles
    private poisonParticles: PoisonParticles
    private blackLungParticles: BlackLungParticles

    updateActiveConditions() {
        if (this.conditions.length === 0) {
            return
        }

        this.conditions.forEach((c) => {
            const timeSinceLastExec = WorldTime.instance.time - c.lastExec

            if (c.expiration < WorldTime.instance.time || !this.isAlive) {
                this.removeCondition(c.condition)
                if (!this.isAlive) {
                    console.log(`removing ${c.condition} because ded`)
                }
                return
            }

            switch (c.condition) {
                case Condition.ON_FIRE:
                    if (!this.fireParticles) {
                        this.fireParticles = this.entity.addComponent(
                            new FireParticles(
                                this.colliderSize.x - 4,
                                () =>
                                    this.standingPosition.plusY(-8).plus(this.getAnimationOffset()),
                                () => this.animation.transform.depth + 1
                            )
                        )
                    }
                    LightManager.instance.addLight(
                        here(),
                        this.fireParticles,
                        this.standingPosition.plusY(-TILE_SIZE / 2).plus(this.getAnimationOffset()),
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
                    if (!this.poisonParticles) {
                        this.poisonParticles = this.entity.addComponent(
                            new PoisonParticles(
                                this.colliderSize.x - 4,
                                () =>
                                    this.standingPosition
                                        .plusY(-10)
                                        .plus(this.getAnimationOffset()),
                                () => this.animation.transform.depth + 1
                            )
                        )
                    }
                    if (timeSinceLastExec > 500) {
                        const poisonDamage = 0.25
                        this.damage(poisonDamage, {
                            blockable: false,
                            dodgeable: false,
                        })
                        c.lastExec = WorldTime.instance.time
                    }
                    return
                case Condition.BLACK_LUNG:
                    if (!this.blackLungParticles) {
                        this.blackLungParticles = this.entity.addComponent(
                            new BlackLungParticles(
                                () =>
                                    this.standingPosition.plusY(-8).plus(this.getAnimationOffset()),
                                () => this.animation.transform.depth + 1
                            )
                        )
                    }
                    if (timeSinceLastExec > 500) {
                        // const poisonDamage = 0.25
                        // this.damage(poisonDamage, {
                        //     blockable: false,
                        //     dodgeable: false,
                        // })
                        c.lastExec = WorldTime.instance.time
                    }
                    return
            }
        })
    }

    /**
     * @param duration if zero, unlimited duration
     */
    addCondition(condition: Condition, duration?: number) {
        const expiration = duration ? WorldTime.instance.time + duration : undefined
        const existing = this.conditions.find((c) => c.condition === condition)
        if (existing) {
            if (!duration) {
                existing.expiration = undefined
            } else {
                existing.expiration = Math.max(existing.expiration, expiration)
            }
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
            case Condition.POISONED:
                if (this.poisonParticles) {
                    this.entity.removeComponent(this.poisonParticles)
                    this.poisonParticles = undefined
                }
                return
            case Condition.POISONED:
                if (this.poisonParticles) {
                    this.entity.removeComponent(this.poisonParticles)
                    this.poisonParticles = undefined
                }
                return
        }
    }

    removeAllConditions() {
        this.conditions.forEach((c) => this.removeCondition(c.condition))
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
            condition = undefined,
            conditionDuration = 0,
            conditionBlockable = true,
        }: {
            direction?: Point
            knockback?: number
            attacker?: Dude
            blockable?: boolean
            dodgeable?: boolean
            condition?: Condition
            conditionDuration?: number
            conditionBlockable?: boolean
        }
    ) {
        if (dodgeable && (this.rolling || this.jumping)) {
            return
        }

        if (!this.isAlive) {
            return
        }

        const blocking =
            this.shield?.isBlocking() &&
            // absorb damage if facing the direction of the enemy
            !this.isFacing(this.standingPosition.plus(direction))

        const blocked = blockable && blocking

        if (blocked) {
            damage *= 0.25
            knockback *= 0.4
        }

        if (condition && (!conditionBlockable || !blocking)) {
            this.addCondition(condition, conditionDuration)
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
                .normalizedOrZero()
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
        this.animationDirty = true
        this.animation.transform.rotation = 0
        this.layingDownOffset = null

        this.removeAllConditions()
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
        if (direction.equals(Point.ZERO)) {
            return
        }

        const goal = this.standingPosition.plus(direction.normalized().times(knockback))
        const distToStop = 2
        let intervalsRemaining = 50

        let last = new Date().getTime()
        const knock = () => {
            const now = new Date().getTime()
            const diff = now - last
            if (diff > 0) {
                this.moveTo(this.standingPosition.lerp((0.15 * diff) / 30, goal))
            }
            intervalsRemaining--
            if (
                intervalsRemaining === 0 ||
                goal.minus(this.standingPosition).magnitude() < distToStop
            ) {
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
     * Should be called on EVERY update step to ensure Dude state is maintained correctly
     * @param direction the direction they are moving in, will be normalized by this code
     * @param facingOverride if < 0, will face left, if > 0, will face right. if == 0, will face the direction they're moving
     */
    move(
        elapsedTimeMillis: number,
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

        if (direction.x !== 0 || direction.y !== 0) {
            direction = direction.normalized()
        }

        // Update animations
        if (!this.isJumping) {
            if (this.isMoving) {
                // start walking animation
                // TODO make the run animation backwards if they run backwards :)
                if (!wasMoving || this.animationDirty) {
                    this.animation.goToAnimation(1)
                }
            } else if (wasMoving || this.animationDirty) {
                // start idle animation
                this.animation.goToAnimation(0)
                // hacky slight improvement to the landing animation when standing still
                if (this.wasJumping) {
                    this.animation.fastForward(2 * 80)
                    this.wasJumping = false
                }
            }
        }

        const standingTilePos = pixelPtToTilePt(this.standingPosition)
        const ground = this.location.getGround(standingTilePos)
        const element = this.location.getElement(standingTilePos)

        let speed = 1
        if (this.rolling) {
            speed += 1.2
        } else if (!this.weapon || this.weapon.isSheathed()) {
            speed += 0.35
        }
        if (this.shield?.isBlocking()) {
            speed -= 0.4
        }

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

        const verticalMovement = this.getVerticalMovement(elapsedTimeMillis)
        if (verticalMovement.y < 0) {
            // climbing uphill takes effort
            speedMultiplier = 0
        }

        const walkDistance = elapsedTimeMillis * this.speed * speed * speedMultiplier
        const walkMovement = this.isMoving ? direction.times(walkDistance) : Point.ZERO
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
            const newPos = this.standingPosition.plus(totalMovement)
            this.moveTo(newPos)

            here()
                .getElement(this.tile)
                ?.entity.getComponent(Pushable)
                ?.push(this.standingPosition, direction)
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

    private getVerticalMovement(elapsedTimeMillis: number) {
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
            const speed = fallSpeedY * elapsedTimeMillis
            const levelDiff = this.seaLevel - goalLevel
            const distanceWillMove = Math.min(speed, levelDiff)
            this.seaLevel = this.seaLevel - distanceWillMove
            dy = distanceWillMove * pixelHeightBetweenLevels
        } else if (goalLevel > this.seaLevel) {
            const speed = climbSpeed * elapsedTimeMillis
            const levelDiff = goalLevel - this.seaLevel
            const distanceWillMove = Math.min(speed, levelDiff)
            this.seaLevel = this.seaLevel + distanceWillMove
            dy = -distanceWillMove * pixelHeightBetweenLevels
        }

        return new Point(dx, dy)
    }

    /**
     * @param point World point where the dude will be moved to (standing position),
     *              unless they hit a collider (with skipColliderCheck = false)
     */
    moveTo(point: Point, skipColliderCheck = false) {
        // movement is done based on top-left corner point
        point = point.minus(this.standingOffset)

        const moveFn = skipColliderCheck
            ? (pos: Point) => this.collider.forceSetPosition(pos)
            : (pos: Point) => this.collider.moveTo(pos)

        this.position = moveFn(point.plus(this.relativeColliderPos)).minus(this.relativeColliderPos)

        if (skipColliderCheck) {
            this.seaLevel = this.location.levels?.get(this.tile) ?? 0
        }
    }

    private animationDirty: boolean

    private isRolling = false
    private canJumpOrRoll = true // jumping cooldown
    private rollingOffset: Point

    private isJumping = false
    private wasJumping = false
    private jumpingAnimator: Animator
    private jumpingOffset = 0

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
        controls.vibrate({
            duration: 100,
            strongMagnitude: 0.2,
            weakMagnitude: 0.2,
        })

        const setRotation = (rot: number, offset: Point) => {
            if (this.animation.transform.mirrorX) {
                this.animation.transform.rotation = -rot
                this.rollingOffset = new Point(-offset.x, offset.y)
            } else {
                this.animation.transform.rotation = rot
                this.rollingOffset = offset
            }
        }

        const animationSpeed = 22.5
        this.isRolling = true
        this.canJumpOrRoll = false

        setRotation(45, new Point(6, 8))
        const rotations: [number, Point][] = [
            [90, new Point(6, 10)],
            [112.5, new Point(5, 11)],
            [135, new Point(4, 12)],
            [157.5, new Point(3, 13)],
            [180, new Point(2, 14)],
            [202.5, new Point(1, 13)],
            [225, new Point(0, 12)],
            [247.5, new Point(-1, 11)],
            [270, new Point(-2, 10)],
            [292.5, new Point(-3, 9)],
            [315, new Point(-4, 8)],
            [337.5, new Point(-5, 7)],
        ]
        rotations.forEach(([rotation, offset], i) =>
            setTimeout(() => setRotation(rotation, offset), animationSpeed * (i + 1))
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
                this.entity.getComponent(WalkingParticles).land()
                this.isJumping = false
                this.wasJumping = true
                this.animationDirty = true
                this.jumpingAnimator = undefined
                this.jumpingOffset = 0
                if (this.type === DudeType.PLAYER) {
                    controls.vibrate({
                        duration: 100,
                        strongMagnitude: 0,
                        weakMagnitude: 0.5,
                    })
                }
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

    getAnimationOffset(): Point {
        const offset = new Point(0, -this.jumpingOffset)
        return this.getOffsetRelativeToAnimation().plus(offset)
    }

    getOffsetRelativeToAnimation(): Point {
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
            pos: this.standingPosition.toString(),
            anim: this.characterAnimName,
            maxHealth: this.maxHealth,
            health: this._health,
            weapon: this.weaponType,
            shield: this.shieldType,
            inventory: this.inventory.save(),
            dialogue: this.dialogue,
            blob: this.blob,
            conditions: this.conditions,
            name: this.name,
        }
    }

    getRenderMethods(): RenderMethod[] {
        return this.getIndicator()
    }

    delete() {
        this.removeAllConditions()
        this.location.removeDude(this)
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
                this.log("claimed a pending house slot")
                pending[0].claimPendingSlot(uuid)
            }
            return
        }

        // Probably spawned via dev controls
        const availableResidences = residences.filter((res) => res.hasCapacity(type))
        if (availableResidences.length > 0) {
            availableResidences[0].setResidentPending()
            availableResidences[0].claimPendingSlot(uuid)
            this.log("claimed a house slot")
        } else {
            this.log("could not find a home")
        }
    }

    private getIndicator(): RenderMethod[] {
        let indicator = DudeInteractIndicator.NONE
        if (!this.isAlive) {
            return []
        }

        // little flashing circle right before attacking the player
        const npc = this.entity.getComponent(NPC)
        const attackState = npc?.attackState
        if (npc?.targetedEnemy?.type === DudeType.PLAYER) {
            if (attackState === NPCAttackState.ATTACKING_SOON) {
                indicator = DudeInteractIndicator.ATTACKING_SOON
            } else if (attackState === NPCAttackState.ATTACKING_NOW) {
                indicator = DudeInteractIndicator.ATTACKING_NOW
            }
        } else if (!!this.dialogue && this.dialogue != EMPTY_DIALOGUE) {
            indicator = getDialogue(this.dialogue).indicator
        }

        // if (
        //     this.factions.includes(DudeFaction.VILLAGERS) &&
        //     WorldTime.instance.time < this.lastAttackerTime + 10_000
        // ) {
        //     indicator = DudeInteractIndicator.IMPORTANT_DIALOGUE
        // }

        if (
            indicator === DudeInteractIndicator.IMPORTANT_DIALOGUE ||
            (this.type === DudeType.PLAYER &&
                this.entity.getComponent(Player).isOffMap() &&
                !CutscenePlayerController.instance.enabled)
        ) {
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
                            .plus(this.getAnimationOffset()),
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
