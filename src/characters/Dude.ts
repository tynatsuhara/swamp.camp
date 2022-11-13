import { Component, debug, Point, pt } from "brigsby/dist"
import { BoxCollider } from "brigsby/dist/collision"
import { PointValue } from "brigsby/dist/Point"
import { RenderMethod } from "brigsby/dist/renderer"
import { AnimatedSpriteComponent, SpriteTransform, StaticSpriteSource } from "brigsby/dist/sprites"
import { Animator, Lists, RepeatedInvoker } from "brigsby/dist/util"
import { StepSounds } from "../audio/StepSounds"
import { controls } from "../Controls"
import { CutsceneManager } from "../cutscenes/CutsceneManager"
import { CutscenePlayerController } from "../cutscenes/CutscenePlayerController"
import { DeathCutscene } from "../cutscenes/DeathCutscene"
import { IntroCutscene } from "../cutscenes/IntroCutscene"
import { ImageFilters } from "../graphics/ImageFilters"
import { BlackLungParticles } from "../graphics/particles/BlackLungParticles"
import { emitBlockParticles } from "../graphics/particles/CombatParticles"
import { FireParticles } from "../graphics/particles/FireParticles"
import { PoisonParticles } from "../graphics/particles/PoisonParticles"
import { WalkingParticles } from "../graphics/particles/WalkingParticles"
import { pixelPtToTilePt, TILE_SIZE } from "../graphics/Tilesets"
import { Inventory } from "../items/Inventory"
import { Item, spawnItem } from "../items/Items"
import { session } from "../online/session"
import { clientSyncFn, syncData, syncFn } from "../online/utils"
import { DudeSaveState } from "../saves/DudeSaveState"
import { DialogueDisplay } from "../ui/DialogueDisplay"
import { DudeInteractIndicator } from "../ui/DudeInteractIndicator"
import { HUD } from "../ui/HUD"
import { NotificationDisplay } from "../ui/NotificationDisplay"
import { UIStateManager } from "../ui/UIStateManager"
import { Burnable } from "../world/elements/Burnable"
import { Campfire } from "../world/elements/Campfire"
import { ElementType } from "../world/elements/Elements"
import { Interactable } from "../world/elements/Interactable"
import { Pushable } from "../world/elements/Pushable"
import { Ground } from "../world/ground/Ground"
import { LightManager } from "../world/LightManager"
import { EAST_COAST_OCEAN_WIDTH } from "../world/locations/CampLocationGenerator"
import { Location } from "../world/locations/Location"
import { camp, here } from "../world/locations/LocationManager"
import { Residence } from "../world/residences/Residence"
import { WorldTime } from "../world/WorldTime"
import { ActiveCondition, Condition } from "./Condition"
import { DialogueSource, EMPTY_DIALOGUE, getDialogue } from "./dialogue/Dialogue"
import { DIP_ENTRYPOINT } from "./dialogue/DipDialogue"
import { DudeAnimationUtils } from "./DudeAnimationUtils"
import { DudeFaction } from "./DudeFactory"
import { DudeType } from "./DudeType"
import { NPC } from "./NPC"
import { player } from "./player/index"
import { ReadOnlyShield, Shield } from "./weapons/Shield"
import { ShieldFactory } from "./weapons/ShieldFactory"
import { ShieldType } from "./weapons/ShieldType"
import { ReadOnlyWeapon, Weapon } from "./weapons/Weapon"
import { WeaponFactory } from "./weapons/WeaponFactory"
import { WeaponType } from "./weapons/WeaponType"

export enum AttackState {
    NOT_ATTACKING,
    ATTACKING_SOON,
    ATTACKING_NOW,
}

type SyncData = {
    p: { x: number; y: number } // standing position
    d: { x: number; y: number } // walking direction
    f: boolean // true if facing left, false otherwise
    as: AttackState
    mh: number // max health
    h: number // health
}

export class Dude extends Component implements DialogueSource {
    static readonly PLAYER_COLLISION_LAYER = "playa"
    static readonly NPC_COLLISION_LAYER = "npc"
    static readonly ON_FIRE_LIGHT_DIAMETER = 40

    private readonly syncData: SyncData

    // managed by WorldLocation/LocationManager classes
    location: Location

    blob: object
    readonly uuid: string
    readonly type: DudeType
    readonly factions: DudeFaction[]
    readonly inventory: Inventory
    set maxHealth(val: number) {
        this.syncData.mh = val
    }
    get maxHealth() {
        return this.syncData.mh
    }
    private set _health(val: number) {
        this.syncData.h = val
    }
    private get _health() {
        return this.syncData.h
    }
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
    get weapon(): ReadOnlyWeapon {
        return this._weapon
    }
    get weaponType() {
        return this.weapon?.getType() ?? WeaponType.NONE
    }
    private _shield: Shield
    get shield(): ReadOnlyShield {
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

    get attackState() {
        return this.syncData.as
    }
    set attackState(state: AttackState) {
        this.syncData.as = state
    }

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
    get velocity() {
        return pt(this.syncData.d.x, this.syncData.d.y)
    }
    rollingMomentum: Point

    // manually set a depth for the player sprite
    manualDepth = undefined

    private dialogueInteract: Interactable
    dialogue: string
    private dialogueIndicator = ""

    // conditions are synchronized, but the time-based fields only matter on the host
    private conditions: ActiveCondition[] = []
    private name: string

    static createSyncId(uuid: string, namespace: string) {
        const prefix = uuid.substring(0, 8) // 36^8 should be fine, we have a 12 char limit
        const syncId = prefix + namespace
        if (syncId.length > 12) {
            console.warn(`sync ID ${syncId} is longer than the 12 character limit`)
        }
        return syncId
    }

    syncId(namespace: string) {
        return Dude.createSyncId(this.uuid, namespace)
    }

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

        // populate dudecache for O(1) lookup by uuid
        if (dudeCache[uuid]) {
            console.error(`duplicate dude ${uuid} instantiated`)
        }
        dudeCache[uuid] = this

        // set this before doing anything else because it's needed for generating sync IDs
        this.uuid = uuid

        // initialize synchronized data fields
        this.syncData = syncData(
            this.syncId("data"),
            {
                p: { x: standingPosition.x, y: standingPosition.y },
                f: false,
                d: { x: 0, y: 0 },
                as: AttackState.NOT_ATTACKING,
                mh: maxHealth,
                h: maxHealth === Number.MAX_SAFE_INTEGER ? Number.MAX_SAFE_INTEGER : health,
            },
            (newData) => {
                const newStandingPos = pt(newData.p.x, newData.p.y)
                const direction = pt(newData.d.x, newData.d.y)
                this.moveTo(newStandingPos, true, true)
                this.setFacing(newData.f)
                this.updateAnimationFromMovement(direction)
            }
        )

        this.type = type
        this.factions = factions
        this.speed = speed
        this.inventory = inventory
        this.dialogue = dialogue
        this.blob = blob
        this.conditions = conditions
        this.name = name

        // Synchronized host->client functions

        this.jump = syncFn(this.syncId("jump"), () => {
            const ground = this.location.getGround(this.tile)
            if (!this.canJumpOrRoll || Ground.isWater(ground?.type)) {
                return
            }
            this.canJumpOrRoll = false
            this.doJumpAnimation()
            setTimeout(() => (this.canJumpOrRoll = true), 750)
        })

        this.roll = syncFn(this.syncId("roll"), () => {
            this.rollingMomentum = new Point(this.syncData.d.x, this.syncData.d.y)
            const ground = this.location.getGround(this.tile)
            if (!this.canJumpOrRoll || Ground.isWater(ground?.type)) {
                return
            }
            this.canJumpOrRoll = false
            this.doRollAnimation()
            this.accelerateConditionExpiration(Condition.ON_FIRE, 500)
            for (let i = 0; i < 3; i++) {
                setTimeout(() => {
                    StepSounds.singleFootstepSound(this, 2)
                }, i * 150)
            }
            setTimeout(() => (this.canJumpOrRoll = true), 750)
        })

        this.setWeaponAndShieldDrawn = syncFn(this.syncId("wsd"), (drawn: boolean) => {
            this._weapon?.setSheathed(!drawn)
            this._shield?.setOnBack(!drawn)
        })

        this.updateBlocking = syncFn(this.syncId("blk"), (blocking) => {
            this._shield?.block(blocking)
        })

        this.updateAttacking = syncFn(this.syncId("atk"), (isNewAttack) => {
            this._weapon?.attack(isNewAttack)
        })

        this.cancelAttacking = syncFn(this.syncId("catk"), () => {
            this._weapon?.cancelAttack()
        })

        this.addCondition = syncFn(this.syncId("ac"), (condition, duration) => {
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
        })

        this.removeCondition = syncFn(this.syncId("rc"), (condition) => {
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
                case Condition.BLACK_LUNG:
                    if (this.blackLungParticles) {
                        this.entity.removeComponent(this.blackLungParticles)
                        this.blackLungParticles = undefined
                    }
                    return
            }
        })

        this.onDamageSyncFn = syncFn(this.syncId("odmg"), (...args) => {
            if (this.onDamageCallback) {
                this.onDamageCallback(...args)
            }
        })

        // Synchronized client->host functions

        const setWeapon = (type: WeaponType) => {
            this.weapon?.delete()
            this._weapon = this.entity.addComponent(WeaponFactory.make(type, this.type))
            this._shield?.setOnBack(false) // keep em in sync
        }
        this.setWeapon = clientSyncFn(this.syncId("eqw"), (trusted, type: WeaponType) => {
            if (this.weapon?.getType() === type) {
                return
            } else if (!trusted && !this.inventory.getItemCount(type as unknown as Item)) {
                return "reject"
            }
            setWeapon(type)
        })

        const setShield = (type: ShieldType) => {
            this.shield?.delete()
            this._shield = this.entity.addComponent(ShieldFactory.make(type, this.type))
            this._weapon?.setSheathed(false) // keep em in sync
        }
        this.setShield = clientSyncFn(this.syncId("eqs"), (trusted, type: ShieldType) => {
            if (this.shield?.type === type) {
                return
            } else if (!trusted && !this.inventory.getItemCount(type as unknown as Item)) {
                return "reject"
            }
            setShield(type)
        })

        // Component lifecycle functions

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

            // Not using the synchronized methods because clients don't need to tell hosts
            setWeapon(weaponType)
            setShield(shieldType)

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
                    (interactor) => {
                        if (!this.dialogue || !this.entity.getComponent(NPC)?.canTalk()) {
                            return false
                        }

                        if (session.isHost()) {
                            return interactor === player()
                        } else {
                            // TODO: Implement a more thorough approach to this
                            const canGuestAccessDialogue = [DIP_ENTRYPOINT].includes(this.dialogue)
                            return canGuestAccessDialogue
                        }
                    }
                )
            )

            StepSounds.startFootstepSoundLoop(this)
        }

        this.start = () => {
            this.seaLevel = this.location.levels?.get(this.tile) ?? 0

            if (session.isHost()) {
                this.claimResidence(type, uuid, hasPendingSlot)

                // Damage dudes walking through blackberries
                this.doWhileLiving(() => {
                    if (
                        this.isMoving &&
                        !this.isJumping &&
                        here().getElement(this.tile)?.type === ElementType.BLACKBERRIES
                    ) {
                        this.damage(0.25, {
                            direction: Point.ZERO.randomCircularShift(1),
                            knockback: 5,
                            blockable: false,
                            dodgeable: false,
                        })
                    }
                }, 600)
            }

            // Update dialogue indicator
            this.doWhileLiving(() => {
                if (this.dialogue) {
                    this.dialogueIndicator =
                        getDialogue(this.dialogue)?.indicator ?? DudeInteractIndicator.NONE
                }
            }, 1000)
        }
    }

    update({ elapsedTimeMillis }) {
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

        this.updateActiveConditions(elapsedTimeMillis)

        this.jumpingAnimator?.update(elapsedTimeMillis)
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

    // sync functions
    readonly setWeapon: (type: WeaponType) => void
    readonly setShield: (type: ShieldType) => void
    readonly setWeaponAndShieldDrawn: (drawn: boolean) => void
    readonly updateBlocking: (blocking: boolean) => void
    readonly updateAttacking: (isNewAttack: boolean) => void
    readonly cancelAttacking: () => void
    /**
     * @param duration if zero, unlimited duration
     */
    readonly addCondition: (condition: Condition, duration?: number) => void
    readonly removeCondition: (condition: Condition) => void

    private fireParticles: FireParticles
    private poisonParticles: PoisonParticles
    private blackLungParticles: BlackLungParticles

    updateActiveConditions(elapsedTimeMillis: number) {
        if (this.conditions.length === 0) {
            return
        }

        this.conditions.forEach((c) => {
            const timeSinceLastExec = WorldTime.instance.time - c.lastExec

            if (session.isHost()) {
                if (c.expiration < WorldTime.instance.time || !this.isAlive) {
                    this.removeCondition(c.condition)
                    if (!this.isAlive) {
                        console.log(`removing ${c.condition} because ded`)
                    }
                    return
                }
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
                        Dude.ON_FIRE_LIGHT_DIAMETER
                    )
                    if (session.isHost() && timeSinceLastExec > 500) {
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
                    if (session.isHost() && timeSinceLastExec > 500) {
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
                    return
                case Condition.HEALING:
                    if (session.isHost()) {
                        this.heal(elapsedTimeMillis / 3500)
                    }
                    return
            }
        })
    }

    removeAllConditions() {
        this.conditions.forEach((c) => this.removeCondition(c.condition))
    }

    hasCondition(condition: Condition) {
        return this.conditions.some((c) => c.condition === condition)
    }

    accelerateConditionExpiration(condition: Condition, skipDuration: number) {
        const c = this.conditions.find((c) => c.condition === condition)
        if (c?.expiration) {
            c.expiration -= skipDuration
        }
    }

    get isAlive() {
        return this.health > 0
    }

    // MPTODO
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
            direction?: { x: number; y: number }
            knockback?: number
            attacker?: Dude
            blockable?: boolean
            dodgeable?: boolean
            condition?: Condition
            conditionDuration?: number
            conditionBlockable?: boolean
        }
    ) {
        if (session.isGuest()) {
            console.warn(`guests can't call damage()`)
            return
        }
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
            emitBlockParticles(this.uuid) // sync fn
            damage *= 0.25
            knockback *= 0.4
        }

        if (condition && (!conditionBlockable || !blocking)) {
            this.addCondition(condition, conditionDuration) // sync fn
        }

        if (this.isAlive) {
            if (
                (this.type === DudeType.PLAYER && debug.godMode) ||
                this.maxHealth === Number.MAX_SAFE_INTEGER
            ) {
                damage = 0
            }
            if (damage !== 0) {
                this._health -= damage
                if (!this.isAlive) {
                    this.die(direction) // MPTODO sync die
                    knockback *= 1 + Math.random()
                }
            }
        }

        if (knockback > 0) {
            this.knockback(direction, knockback)
        }

        this.onDamageSyncFn(blocked) // sync fn

        if (attacker) {
            this.lastAttacker = attacker
            this.lastAttackerTime = WorldTime.instance.time
        }
        this.lastDamageTime = WorldTime.instance.time
    }

    lastAttacker: Dude
    lastAttackerTime: number
    lastDamageTime: number

    private onDamageSyncFn: typeof this.onDamageCallback
    private onDamageCallback: (blocked: boolean) => void
    setOnDamageCallback(fn: typeof this.onDamageCallback) {
        this.onDamageCallback = fn
    }

    // TODO: Consider just dropping everything in their inventory instead
    droppedItemSupplier: (() => Item[]) | undefined
    private layingDownOffset: Point

    // MPTODO
    die({ x: dx, y: dy }: PointValue = new Point(-1, 0)) {
        this._health = 0
        const direction = pt(dx, dy)

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
        if (this.droppedItemSupplier) {
            const items = this.droppedItemSupplier()
            items.forEach((item) => {
                const randomness = 8
                const velocity = direction
                    .normalizedOrZero()
                    .plus(new Point(Math.random() - 0.5, Math.random() - 0.5).times(randomness))
                setTimeout(
                    () =>
                        spawnItem({
                            pos: this.standingPosition.minus(new Point(0, 2)),
                            item,
                            velocity,
                            sourceCollider: this.collider,
                        }),
                    100
                )
            })
        }

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
                setTimeout(() => {
                    this.revive()
                    this.addCondition(Condition.HEALING, 10_000)
                }, 1000 + Math.random() * 1000)
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

    // MPTODO
    revive() {
        this._health = this.maxHealth * 0.25

        // stand up
        this.animationDirty = true
        this.animation.transform.rotation = 0
        this.layingDownOffset = null

        this.removeAllConditions()
    }

    // MPTODO
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

    private knockIntervalCallback: number = 0
    knockback({ x: dx, y: dy }: PointValue, knockback: number) {
        if (session.isGuest()) {
            console.warn(`guests can't call knockback()`)
            return
        }
        if (dx === 0 && dy === 0) {
            return
        }

        if (this.knockIntervalCallback !== 0) {
            window.cancelAnimationFrame(this.knockIntervalCallback)
        }

        const direction = pt(dx, dy)
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
        if (session.isGuest()) {
            console.warn(`guests can't call heal()`)
            return
        }
        if (this.isAlive) {
            this._health = Math.min(this.maxHealth, this.health + amount)
        }
    }

    private setFacing(facingLeft: boolean) {
        const existingDir = this.animation.transform.mirrorX
        if (existingDir !== facingLeft) {
            this.animation.transform.mirrorX = facingLeft
            if (session.isHost()) {
                this.syncData.f = facingLeft
            }
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
        // this is only executed on the host
        if (session.isGuest()) {
            return
        }

        if (!this.isAlive) {
            return
        }

        if (this.knockIntervalCallback !== 0) {
            // being knocked back, don't let em walk
            direction = Point.ZERO
        }

        if ((direction.x < 0 && facingOverride === 0) || facingOverride < 0) {
            this.setFacing(true)
        } else if ((direction.x > 0 && facingOverride === 0) || facingOverride > 0) {
            this.setFacing(false)
        }

        direction = direction.normalizedOrZero()

        this.updateAnimationFromMovement(direction)
        if (this.syncData.d.x !== direction.x || this.syncData.d.y !== direction.y) {
            this.syncData.d = direction
        }

        // Movement calculations and conditions based on movement — only done host-side

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

        if (element?.type === ElementType.BLACKBERRIES && !this.isJumping) {
            speed *= 0.6
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
            ((element?.type === ElementType.CAMPFIRE &&
                element.entity.getComponent(Campfire).isBurning &&
                this.standingPosition.distanceTo(
                    standingTilePos.times(TILE_SIZE).plus(new Point(8, 10))
                ) < 5) ||
                element?.entity?.getComponent(Burnable)?.isBurningAt(this.tile))
        ) {
            this.addCondition(Condition.ON_FIRE, 2000 + Math.random() * 2000)
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
        }
    }

    private seaLevel: number // matches the scale of WorldLocation.levels

    private getLevelAt(pos: Point) {
        const tilePos = pixelPtToTilePt(pos)
        const currentLevel = this.location.levels?.get(tilePos) ?? 0
        const ground = this.location.getGround(tilePos)
        if (Ground.isWater(ground?.type)) {
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
     * Run host and guest side on sync
     */
    private updateAnimationFromMovement(direction: Point) {
        direction = direction.normalizedOrZero()
        const wasMoving = this.isMoving
        this._isMoving = direction.x !== 0 || direction.y !== 0

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

        this.animationDirty = false

        // Just do this here because why not
        here().getElement(this.tile)?.entity.getComponent(Pushable)?.push(this, direction)
    }

    /**
     * @param point World point where the dude will be moved to (standing position),
     *              unless they hit a collider (with skipColliderCheck = false)
     */
    moveTo(point: Point, skipColliderCheck = false, isReceivedFromHost = false) {
        if (session.isGuest() && !isReceivedFromHost) {
            return
        }

        // movement is done based on top-left corner point
        point = point.minus(this.standingOffset)

        // no need to move
        if (this.position.equals(point)) {
            return
        }

        const moveFn = skipColliderCheck
            ? (pos: Point) => this.collider.forceSetPosition(pos)
            : (pos: Point) => this.collider.moveTo(pos)

        this.position = moveFn(point.plus(this.relativeColliderPos)).minus(this.relativeColliderPos)

        // TODO translate to standing pos
        if (session.isHost()) {
            this.syncData.p = this.standingPosition
        }

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

    readonly roll: () => void

    get rolling() {
        return this.isRolling
    }

    // has a rolling animation, however janky
    private doRollAnimation() {
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

    readonly jump: () => void

    get jumping() {
        return this.isJumping
    }

    // just a stepping dodge instead of a roll
    private doJumpAnimation() {
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
                this.updateAnimationFromMovement(Point.ZERO)
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

    // fn will execute immediately (unless initialDelay > 0) and every intervalMillis milliseconds
    // until the NPC is dead or the function returns true
    doWhileLiving(fn: () => boolean | void, intervalMillis: number, initialDelay?: number) {
        if (!this.isAlive) {
            return
        }

        if (!initialDelay && fn()) {
            return
        }

        const invoker = this.entity.addComponent(
            new RepeatedInvoker(() => {
                if (!this.isAlive || fn()) {
                    invoker.delete()
                }
                return intervalMillis
            }, initialDelay ?? intervalMillis)
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

    /**
     * @returns -1 if the player is facing left, otherwise 1
     */
    getFacingMultiplier(): 1 | -1 {
        return this.animation.transform.mirrorX ? -1 : 1
    }

    getAnimationOffset(): Point {
        const offset = new Point(0, -this.jumpingOffset)
        return this.getOffsetRelativeToAnimation().plus(offset)
    }

    getOffsetRelativeToAnimation(): Point {
        if (this.isJumping) {
            // The jumping animation is a single static frame
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
            health: this.health,
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
        dudeCache[this.uuid] = undefined
        super.delete()
    }

    getCurrentOffMapArea(): "swamp" | "ocean" | undefined {
        if (this.location.isInterior) {
            return
        }
        const range = here().range
        const pos = this.tile
        if (pos.x < -range || pos.x > range || pos.y < -range || pos.y > range) {
            return pos.x > range - EAST_COAST_OCEAN_WIDTH ? "ocean" : "swamp"
        }
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
                pending[0].claimPendingSlot(this.type, uuid)
            }
            return
        }

        // Probably spawned via dev controls
        const availableResidences = residences.filter((res) => res.hasCapacity(type))
        if (availableResidences.length > 0) {
            availableResidences[0].setResidentPending(this.type)
            availableResidences[0].claimPendingSlot(this.type, uuid)
            this.log("claimed a house slot")
        } else {
            // this.log("could not find a home")
        }
    }

    private getIndicator(): RenderMethod[] {
        let indicator = DudeInteractIndicator.NONE
        if (!this.isAlive) {
            return []
        }

        // little flashing circle right before attacking the player
        const npc = this.entity.getComponent(NPC)
        if (npc?.targetedEnemy === player()) {
            if (this.attackState === AttackState.ATTACKING_SOON) {
                indicator = DudeInteractIndicator.ATTACKING_SOON
            } else if (this.attackState === AttackState.ATTACKING_NOW) {
                indicator = DudeInteractIndicator.ATTACKING_NOW
            }
        } else if (this.dialogue && this.dialogue != EMPTY_DIALOGUE) {
            indicator = this.dialogueIndicator
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
                this.getCurrentOffMapArea() &&
                !CutscenePlayerController.instance.enabled)
        ) {
            // update off screen indicator
            HUD.instance.addIndicator(
                this,
                () => this.standingPosition,
                () => this.location
            )
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

    static get(uuid: string) {
        return dudeCache[uuid]
    }

    static getAll() {
        return Object.values(dudeCache)
    }

    static clearLookupCache() {
        dudeCache = {}
    }
}

let dudeCache: Record<string, Dude> = {}
