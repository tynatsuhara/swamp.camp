import { BoxCollider } from "../../engine/collision/BoxCollider"
import { Component } from "../../engine/component"
import { UpdateData } from "../../engine/engine"
import { Point } from "../../engine/point"
import { RenderMethod } from "../../engine/renderer/RenderMethod"
import { AnimatedTileComponent } from "../../engine/tiles/AnimatedTileComponent"
import { StaticTileSource } from "../../engine/tiles/StaticTileSource"
import { TileTransform } from "../../engine/tiles/TileTransform"
import { ImageFilters } from "../graphics/ImageFilters"
import { TILE_SIZE } from "../graphics/Tilesets"
import { Inventory } from "../items/Inventory"
import { Item, spawnItem } from "../items/Items"
import { DudeSaveState } from "../saves/DudeSaveState"
import { DialogueDisplay } from "../ui/DialogueDisplay"
import { DudeInteractIndicator } from "../ui/DudeInteractIndicator"
import { UIStateManager } from "../ui/UIStateManager"
import { Interactable } from "../world/elements/Interactable"
import { LocationManager } from "../world/LocationManager"
import { DudeAnimationUtils } from "./DudeAnimationUtils"
import { DialogueSource, getDialogue, EMPTY_DIALOGUE } from "./Dialogue"
import { DudeFaction, DudeType } from "./DudeFactory"
import { Shield } from "./weapons/Shield"
import { Weapon } from "./weapons/Weapon"
import { WeaponType } from "./weapons/WeaponType"
import { WeaponFactory } from "./weapons/WeaponFactory"

export class Dude extends Component implements DialogueSource {

    static readonly PLAYER_COLLISION_LAYER = "playa"
    static readonly NPC_COLLISION_LAYER = "npc"
    
    blob: object
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
    private shieldId: string
    get shield() { return this._shield }

    private collider: BoxCollider
    private relativeColliderPos: Point = new Point(3, 15)
    
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
        type: DudeType,
        factions: DudeFaction[],
        characterAnimName: string,
        position: Point,
        weaponType: WeaponType,
        shieldId: string,
        maxHealth: number,
        health: number,
        speed: number,
        inventory: Inventory,
        dialogue: string,
        blob: object,
    ) {
        super()
        this.type = type
        this.factions = factions
        this._position = position
        this.shieldId = shieldId
        this.maxHealth = maxHealth
        this._health = health
        this.speed = speed
        this.inventory = inventory
        this.dialogue = dialogue
        this.blob = blob

        this.awake = () => {
            // Set up animations
            this.characterAnimName = characterAnimName
            const idleAnim = DudeAnimationUtils.getCharacterIdleAnimation(characterAnimName, blob)
            const runAnim = DudeAnimationUtils.getCharacterWalkAnimation(characterAnimName, blob)
            const height = idleAnim.getTile(0).dimensions.y
            this._animation = this.entity.addComponent(new AnimatedTileComponent([idleAnim, runAnim], new TileTransform(new Point(0, 28-height))))
            this._animation.fastForward(Math.random() * 1000)  // so not all the animations sync up
    
            this.setWeapon(weaponType)

            if (!!shieldId) {
                this._shield = this.entity.addComponent(new Shield(shieldId))
            }

            // Set up collider
            // TODO: Add collider size options for tiny and large enemies
            const colliderSize = new Point(10, 8)
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
                () => !UIStateManager.instance.isMenuOpen && !this.isMoving && !!this.dialogue
            ))
        }
    }

    update(updateData: UpdateData) {
        // All other transforms (eg the weapon) are positioned relative to the animation
        this.animation.transform.position = this.position.plus(this.isAlive ? new Point(0, 0) : this.deathOffset)
        this.animation.transform.depth = this.collider.position.y + this.collider.dimensions.y

        this.dialogueInteract.position = this.standingPosition.minus(new Point(0, 5))
        this.dialogueInteract.uiOffset = new Point(0, -TILE_SIZE * 1.5).plus(this.getAnimationOffsetPosition())
        this.dialogueInteract.enabled = this.dialogue !== EMPTY_DIALOGUE && DialogueDisplay.instance.dialogueSource !== this
    }

    setWeapon(type: WeaponType) {
        if (!!this.weapon) {
            this.entity.removeComponent(this.weapon)
        }
        this._weapon = WeaponFactory.make(type)
        if (!!this._weapon) {
            this.entity.addComponent(this._weapon)
        }
    }

    get isAlive() { return this._health > 0 }

    damage(damage: number, direction: Point, knockback: number) {
        // TODO: disable friendly fire

        // absorb damage if facing the direction of the enemy
        if (this.shield?.isBlocking() && !this.isFacing(this.standingPosition.plus(direction))) {
            damage *= .25
            knockback *= .3
        }
        
        if (this.isAlive) {
            this._health -= damage
            if (!this.isAlive) {
                this.die(direction)
                knockback *= (1 + Math.random())
            }
        }

        this.knockback(direction, knockback)
    }

    private deathOffset: Point
    die(direction: Point = new Point(-1, 0)) {
        this._health = 0
        const prePos = this.animation.transform.position
        this.animation.transform.rotate(
            90 * (direction.x >= 0 ? 1 : -1), 
            this.standingPosition.minus(new Point(0, 5))
        )
        this.deathOffset = this.animation.transform.position.minus(prePos)
        this.animation.goToAnimation(0)
        this.animation.paused = true
        setTimeout(() => this.spawnDrop(), 100)
        this.dropWeapon()
        setTimeout(() => this.dissolve(), 1000)
    }

    // TODO maybe use this for demons in sunlight
    private dissolve() {
        this.collider.enabled = false
        let dissolveChance = .1
        const interval = setInterval(() => {
            this.animation.applyFilter(ImageFilters.dissolve(() => dissolveChance))
            this.animation.goToAnimation(0)  // refresh even though it's paused
            if (dissolveChance >= 1) {
                this.entity.selfDestruct()
                clearInterval(interval)
            }
            dissolveChance *= 2
        }, 200)
    }

    private spawnDrop() {
        // TODO add velocity
        spawnItem(this.standingPosition.minus(new Point(0, 2)), Item.COIN)
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
        maxDistance: number = Number.MAX_SAFE_INTEGER, 
    ) {
        if (this._health <= 0) {
            return
        }

        if (this.knockIntervalCallback !== 0) {  // being knocked back, don't let em walk
            direction = direction.times(0)
        }

        const dx = direction.x
        const dy = direction.y

        if ((dx < 0 && facingOverride === 0) || facingOverride < 0) {
            this.animation.transform.mirrorX = true
        } else if ((dx > 0 && facingOverride === 0) || facingOverride > 0) {
            this.animation.transform.mirrorX = false
        }
        
        const wasMoving = this.isMoving
        this._isMoving = dx != 0 || dy != 0

        if (this.isMoving) {
            if (!wasMoving) {
                this.animation.goToAnimation(1)  // TODO make the run animation backwards if they run backwards :)
            }
            const translation = direction.normalized()
            // this.lerpedLastMoveDir = this.lerpedLastMoveDir.lerp(0.25, translation)
            const distance = Math.min(updateData.elapsedTimeMillis * this.speed * speedMultiplier, maxDistance)
            const newPos = this._position.plus(translation.times(distance))
            this.moveTo(newPos)
        } else if (wasMoving) {
            this.animation.goToAnimation(0)
        }
    }

    /**
     * @param point World point where the dude will be moved, unless they hit a collider
     */
    moveTo(point: Point) {
        this._position = this.collider.moveTo(point.plus(this.relativeColliderPos)).minus(this.relativeColliderPos)
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
            type: this.type,
            pos: this.position.toString(),
            anim: this.characterAnimName,
            maxHealth: this.maxHealth,
            health: this._health,
            speed: this.speed,
            weapon: this.weaponType,
            shield: this.shieldId,
            inventory: this.inventory.save(),
            dialogue: this.dialogue,
            blob: this.blob,
        }
    }

    getRenderMethods(): RenderMethod[] {
        return this.getIndicator()
    }

    delete() {
        LocationManager.instance.getLocations().forEach(l => l.dudes.delete(this))
        super.delete()
    }

    private getIndicator(): RenderMethod[] {
        let indicator = DudeInteractIndicator.NONE
        if (!!this.dialogue && this.dialogue != EMPTY_DIALOGUE) {
            indicator = getDialogue(this.dialogue).indicator
        }
        let tile: StaticTileSource = DudeInteractIndicator.getTile(indicator)
        if (!tile || this.dialogueInteract.isShowingUI || DialogueDisplay.instance.dialogueSource === this) {
            return []
        } else {
            return [tile.toImageRender(new TileTransform(
                this.standingPosition.plusY(-28).plus(new Point(1, 1).times(-TILE_SIZE/2)).plus(this.getAnimationOffsetPosition()),
                new Point(TILE_SIZE, TILE_SIZE), 0, false, false, UIStateManager.UI_SPRITE_DEPTH
            ))]
        }
    }
}