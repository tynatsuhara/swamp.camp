import { BoxCollider } from "../../engine/collision/BoxCollider"
import { Component } from "../../engine/Component"
import { debug } from "../../engine/Debug"
import { UpdateData } from "../../engine/Engine"
import { Point } from "../../engine/Point"
import { RenderMethod } from "../../engine/renderer/RenderMethod"
import { AnimatedTileComponent } from "../../engine/tiles/AnimatedTileComponent"
import { StaticTileSource } from "../../engine/tiles/StaticTileSource"
import { TileTransform } from "../../engine/tiles/TileTransform"
import { StepSounds } from "../audio/StepSounds"
import { CutsceneManager } from "../cutscenes/CutsceneManager"
import { DeathCutscene } from "../cutscenes/DeathCutscene"
import { IntroCutscene } from "../cutscenes/IntroCutscene"
import { ImageFilters } from "../graphics/ImageFilters"
import { pixelPtToTilePt, TILE_SIZE } from "../graphics/Tilesets"
import { WalkingParticles } from "../graphics/WalkingParticles"
import { Inventory } from "../items/Inventory"
import { Item, spawnItem } from "../items/Items"
import { DudeSaveState } from "../saves/DudeSaveState"
import { DialogueDisplay } from "../ui/DialogueDisplay"
import { DudeInteractIndicator } from "../ui/DudeInteractIndicator"
import { HUD } from "../ui/HUD"
import { UIStateManager } from "../ui/UIStateManager"
import { Interactable } from "../world/elements/Interactable"
import { GroundType } from "../world/ground/Ground"
import { GroundComponent } from "../world/ground/GroundComponent"
import { LocationManager } from "../world/LocationManager"
import { WorldLocation } from "../world/WorldLocation"
import { DialogueSource, EMPTY_DIALOGUE, getDialogue } from "./Dialogue"
import { DudeAnimationUtils } from "./DudeAnimationUtils"
import { DudeFaction, DudeType } from "./DudeFactory"
import { NPC } from "./NPC"
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
    location: WorldLocation
    
    blob: object
    readonly uuid: string
    readonly type: DudeType
    readonly factions: DudeFaction[]
    readonly inventory: Inventory
    readonly maxHealth: number
    private _health: number
    get health() { return this._health }
    speed: number
    private characterAnimName: string
    private _animation: AnimatedTileComponent
    get animation() { return this._animation }

    private _weapon: Weapon
    get weapon() { return this._weapon }
    get weaponType() { return this.weapon?.getType() ?? WeaponType.NONE}
    private _shield: Shield
    get shield() { return this._shield }
    get shieldType() { return this.shield?.type ?? ShieldType.NONE}

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
        return this.position.plus(new Point(this.animation.transform.dimensions.x/2, this.animation.transform.dimensions.y))
    }
    private _isMoving: boolean
    get isMoving() {
        return this._isMoving
    }

    private dialogueInteract: Interactable
    dialogue: string

    constructor(
        uuid: string,
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

        this.awake = () => {
            // Set up animations
            this.characterAnimName = characterAnimName
            const idleAnim = DudeAnimationUtils.getCharacterIdleAnimation(characterAnimName, blob)
            const runAnim = DudeAnimationUtils.getCharacterWalkAnimation(characterAnimName, blob)
            const jumpAnim = DudeAnimationUtils.getCharacterJumpAnimation(characterAnimName, blob)
            const height = idleAnim.getTile(0).dimensions.y
            this._animation = this.entity.addComponent(
                new AnimatedTileComponent([idleAnim, runAnim, jumpAnim], new TileTransform(new Point(0, 28-height)))
            )
            this._animation.fastForward(Math.random() * 1000)  // so not all the animations sync up
    
            this.setWeapon(weaponType)
            this.setShield(shieldType)

            this.entity.addComponent(new WalkingParticles())

            // Set up collider
            this.relativeColliderPos = new Point(
                this.animation.transform.dimensions.x/2 - colliderSize.x/2, 
                this.animation.transform.dimensions.y - colliderSize.y
            )
            this.collider = this.entity.addComponent(new BoxCollider(
                this.position.plus(this.relativeColliderPos), 
                colliderSize, 
                this.type === DudeType.PLAYER ? Dude.PLAYER_COLLISION_LAYER : Dude.NPC_COLLISION_LAYER
            ))

            this.dialogueInteract = this.entity.addComponent(new Interactable(
                new Point(0, 0), 
                () => DialogueDisplay.instance.startDialogue(this),
                Point.ZERO,
                () => !UIStateManager.instance.isMenuOpen && !!this.dialogue && this.entity.getComponent(NPC)?.canTalk()
            ))
        }

        this.start = () => {
            this.seaLevel = LocationManager.instance.currentLocation.levels?.get(pixelPtToTilePt(this.standingPosition)) ?? 0
        }
    }

    update(updateData: UpdateData) {
        this.animation.transform.depth = this.collider.position.y + this.collider.dimensions.y

        // All other transforms (eg the weapon) are positioned relative to the animation
        this.animation.transform.position = this.position
        if (this.layingDownOffset) {
            this.animation.transform.position = this.animation.transform.position.plus(this.layingDownOffset)
        } else if (this.isRolling && this.animation.transform.rotation !== 0) {
            this.animation.transform.position = this.animation.transform.position.plus(this.rollingOffset)
        }

        if (!!this.dialogueInteract) {
            this.dialogueInteract.position = this.standingPosition.minus(new Point(0, 5))
            this.dialogueInteract.uiOffset = new Point(0, -TILE_SIZE * 1.5).plus(this.getAnimationOffsetPosition())
            this.dialogueInteract.enabled = this.dialogue !== EMPTY_DIALOGUE && DialogueDisplay.instance.dialogueSource !== this
        }
    }

    setWeapon(type: WeaponType) {
        this.weapon?.delete()
        this._weapon = this.entity.addComponent(WeaponFactory.make(type, this.type))
    }

    setShield(type: ShieldType) {
        this.shield?.delete()
        this._shield = this.entity.addComponent(ShieldFactory.make(type))
    }

    get isAlive() { return this._health > 0 }

    damage(damage: number, direction: Point, knockback: number) {
        if (this.rolling()) {
            return
        }

        // absorb damage if facing the direction of the enemy
        let blocked = this.shield?.isBlocking() && !this.isFacing(this.standingPosition.plus(direction))
        if (blocked) {
            damage *= .25
            knockback *= .4
        }
        
        if (this.isAlive) {
            if ((this.type === DudeType.PLAYER && debug.godMode) || this.maxHealth === Number.MAX_SAFE_INTEGER) {
                damage = 0
            }
            this._health -= damage
            if (!this.isAlive) {
                this.die(direction)
                knockback *= (1 + Math.random())
            }
        }

        this.knockback(direction, knockback)

        if (!!this.onDamageCallback) {
            this.onDamageCallback(blocked)
        }
    }

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
        items.forEach(item => {
            const randomness = 8
            const velocity = direction.normalized().plus(new Point(Math.random()-.5, Math.random()-.5).times(randomness))
            setTimeout(
                () => spawnItem(this.standingPosition.minus(new Point(0, 2)), item, velocity, this.collider), 
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

        // play death cutscene if applicable
        if (this.type === DudeType.PLAYER) {
            if (CutsceneManager.instance.isCutsceneActive(IntroCutscene)) {
                setTimeout(() => this.revive(), 1000 + Math.random() * 1000);
            } else {
                CutsceneManager.instance.startCutscene(new DeathCutscene())
            }
        }
    }

    revive() {
        this._health = this.maxHealth * .25

        // stand up
        this.animation.transform.rotation = 0
        this.layingDownOffset = null
    }

    dissolve() {
        let dissolveChance = .1
        const interval = setInterval(() => {
            this.animation.applyFilter(ImageFilters.dissolve(() => dissolveChance))
            this.animation.goToAnimation(0)  // refresh even though it's paused
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
                this.moveTo(this.position.lerp(.15 * diff/30, goal))
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
        speedMultiplier: number = 1,
    ) {
        if (this._health <= 0) {
            return
        }

        if (this.knockIntervalCallback !== 0) {  // being knocked back, don't let em walk
            direction = Point.ZERO
        }

        if ((direction.x < 0 && facingOverride === 0) || facingOverride < 0) {
            this.animation.transform.mirrorX = true
        } else if ((direction.y > 0 && facingOverride === 0) || facingOverride > 0) {
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
        const ground = LocationManager.instance.currentLocation.ground.get(standingTilePos)
        if (ground?.type === GroundType.WATER && !this.isJumping) {
            speedMultiplier *= .4
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
        if (depthAfterWalk === depthAfterVerticalMove){
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

    private seaLevel: number  // matches the scale of WorldLocation.levels

    private getLevelAt(pos: Point) {
        const tilePos = pixelPtToTilePt(pos)
        const currentLevel = LocationManager.instance.currentLocation.levels?.get(tilePos) ?? 0
        const ground = LocationManager.instance.currentLocation.ground.get(tilePos)
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

        const fallSpeedY = .0075
        const climbSpeed = .0050
        const pixelHeightBetweenLevels = 10  // the distance between levels

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
        this._position = moveFn(point.plus(this.relativeColliderPos)).minus(this.relativeColliderPos)
        if (skipColliderCheck) {
            this.seaLevel = LocationManager.instance.currentLocation.levels?.get(pixelPtToTilePt(this.standingPosition)) ?? 0
        }
    }

    private isRolling = false
    get isJumping() {
        return this.isRolling
    }
    private canRoll = true
    private rollingOffset: Point
    private animationDirty: boolean
    private rollFunction = this.dashRoll

    roll() {
        const ground = LocationManager.instance.currentLocation.ground.get(pixelPtToTilePt(this.standingPosition))
        if (!this.canRoll || ground?.type === GroundType.WATER) {
            return
        }
        this.canRoll = false
        this.rollFunction()
        setTimeout(() => this.canRoll = true, 750)
    }

    // just a stepping dodge instead of a roll
    private dashRoll() {
        StepSounds.singleFootstepSound(2)
        this.isRolling = true;
        this.animation.goToAnimation(2)  
        setTimeout(() => {
            StepSounds.singleFootstepSound(3)
            this.isRolling = false
            this.animationDirty = true
        }, 200)
    }

    // has a rolling animation, however janky
    private legacyRoll() {
        const setRotation = (rot: number, offset: Point) => {
            if (this.animation.transform.mirrorX) {
                this.animation.transform.rotation = -rot
                this.rollingOffset = new Point(-offset.x, offset.y)
            } else {
                this.animation.transform.rotation = rot
                this.rollingOffset = offset
            }
        }

        const animationSpeed = 80
        this.isRolling = true
        this.canRoll = false

        setRotation(90, new Point(6, 8))
        setTimeout(() => setRotation(180, new Point(0, 14)), animationSpeed)
        setTimeout(() => setRotation(270, new Point(-6, 8)), animationSpeed * 2)
        setTimeout(() => {
            setRotation(0, Point.ZERO)
            this.isRolling = false
        }, animationSpeed * 3)
    }

    rolling() {
        return this.isRolling
    }

    /**
     * Returns true if these dudes have no factions in common
     */
    isEnemy(d: Dude) {
        return !d.factions.some(fac => this.factions.includes(fac))
    }

    isFacing(pt: Point) {
        if (pt.x === this.standingPosition.x) {
            return true
        }
        return this.animation.transform.mirrorX === (pt.x < this.standingPosition.x)
    }

    facingMultipler() {
        return this.animation.transform.mirrorX ? -1 : 1
    }

    getAnimationOffsetPosition(): Point {
        if (this.isRolling && this.rollFunction === this.dashRoll) {
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
        }
    }

    getRenderMethods(): RenderMethod[] {
        return this.getIndicator()
    }

    delete() {
        this.location.dudes.delete(this)
        super.delete()
    }

    private getIndicator(): RenderMethod[] {
        let indicator = DudeInteractIndicator.NONE
        if (!this.isAlive) {
            return []
        }
        
        const npcAttackIndicator = this.entity.getComponent(NPC)?.attackIndicator
        if (!!npcAttackIndicator) {
            indicator = npcAttackIndicator
        } else if (!!this.dialogue && this.dialogue != EMPTY_DIALOGUE) {
            indicator = getDialogue(this.dialogue).indicator
        }

        // Update off screen indicator
        if (indicator === DudeInteractIndicator.IMPORTANT_DIALOGUE) {
            HUD.instance.addIndicator(this, () => this.standingPosition)
        } else {
            HUD.instance.removeIndicator(this)
        }

        // render indicator icon overhead
        let tile: StaticTileSource = DudeInteractIndicator.getTile(indicator)
        if (!tile || this.dialogueInteract?.isShowingUI || DialogueDisplay.instance.dialogueSource === this) {
            return []
        } else {
            return [tile.toImageRender(new TileTransform(
                this.standingPosition.plusY(-28).plus(new Point(1, 1).times(-TILE_SIZE/2)).plus(this.getAnimationOffsetPosition()),
                new Point(TILE_SIZE, TILE_SIZE), 0, false, false, UIStateManager.UI_SPRITE_DEPTH
            ))]
        }
    }

    private log(message: any) {
        console.log(`${DudeType[this.type]}: ${message}`)
    }
}