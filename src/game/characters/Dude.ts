import { AnimatedTileComponent } from "../../engine/tiles/AnimatedTileComponent"
import { UpdateData } from "../../engine/engine"
import { Point } from "../../engine/point"
import { Component } from "../../engine/component"
import { BoxCollider } from "../../engine/collision/BoxCollider"
import { TILE_SIZE } from "../graphics/Tilesets"
import { Weapon } from "./Weapon"
import { Inventory } from "../items/Inventory"
import { spawnItem, Item } from "../items/Items"
import { DudeType, DudeFaction } from "./DudeFactory"
import { Shield } from "./Shield"
import { TileTransform } from "../../engine/tiles/TileTransform"
import { Interactable } from "../world/elements/Interactable"
import { DudeSaveState } from "../saves/DudeSaveState"
import { Dialogue, getDialogue } from "./Dialogue"
import { DialogueDisplay } from "../ui/DialogueDisplay"
import { RenderMethod } from "../../engine/renderer/RenderMethod"
import { DudeInteractIndicator } from "../ui/DudeInteractIndicator"
import { StaticTileSource } from "../../engine/tiles/StaticTileSource"
import { UIStateManager } from "../ui/UIStateManager"
import { AnimationUtils } from "./AnimationUtils"

export class Dude extends Component {

    static readonly COLLISION_LAYER = "dube"
    
    blob: object
    readonly type: DudeType
    readonly faction: DudeFaction
    readonly inventory: Inventory
    readonly maxHealth: number
    private _health: number
    get health() { return this._health }
    speed: number
    private _animation: AnimatedTileComponent
    get animation() { return this._animation }

    private _weapon: Weapon
    private weaponId: string
    get weapon() { return this._weapon }
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
    dialogue: Dialogue

    constructor(
        type: DudeType,
        faction: DudeFaction,
        characterAnimName: string,
        position: Point,
        weaponId: string,
        shieldId: string,
        maxHealth: number,
        health: number,
        speed: number,
        inventory: Inventory,
        dialogue: Dialogue,
        blob: object,
    ) {
        super()
        this.type = type
        this.faction = faction
        this._position = position
        this.weaponId = weaponId
        this.shieldId = shieldId
        this.maxHealth = maxHealth
        this._health = health
        this.speed = speed
        this.inventory = inventory
        this.dialogue = dialogue
        this.blob = blob

        this.awake = () => {
            // Set up animations
            const idleAnim = AnimationUtils.getCharacterIdleAnimation(characterAnimName)
            const runAnim = AnimationUtils.getCharacterWalkAnimation(characterAnimName)
            const height = idleAnim.getTile(0).dimensions.y
            this._animation = this.entity.addComponent(new AnimatedTileComponent([idleAnim, runAnim], new TileTransform(new Point(0, 28-height))))
            this._animation.fastForward(Math.random() * 1000)  // so not all the animations sync up
    
            if (!!weaponId) {
                this._weapon = this.entity.addComponent(new Weapon(weaponId))
            }
            if (!!shieldId) {
                this._shield = this.entity.addComponent(new Shield(shieldId))
            }

            // Set up collider
            const colliderSize = new Point(10, 8)
            this.relativeColliderPos = new Point(
                this.animation.transform.dimensions.x/2 - colliderSize.x/2, 
                this.animation.transform.dimensions.y - colliderSize.y
            )
            this.collider = this.entity.addComponent(new BoxCollider(this.position.plus(this.relativeColliderPos), colliderSize, Dude.COLLISION_LAYER))

            this.dialogueInteract = this.entity.addComponent(new Interactable(new Point(0, 0), () => {
                if (!!this.dialogue) {
                    DialogueDisplay.instance.startDialogue(this)
                }
            }))
        }
    }

    update(updateData: UpdateData) {
        // All other transforms (eg the weapon) are positioned relative to the animation
        this.animation.transform.position = this.position.plus(this.isAlive ? new Point(0, 0) : this.deathOffset)
        this.animation.transform.depth = this.collider.position.y + this.collider.dimensions.y

        this.dialogueInteract.position = this.standingPosition.minus(new Point(0, 5))
        this.dialogueInteract.uiOffset = new Point(1, -TILE_SIZE * 1.5).plus(this.getAnimationOffsetPosition())
        this.dialogueInteract.enabled = this.dialogue !== Dialogue.NONE
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
        this.animation.play(0)
        this.animation.paused = true
        setTimeout(() => this.spawnDrop(), 100)
        this.dropWeapon()
    }

    private spawnDrop() {
        // TODO add velocity
        spawnItem(this.standingPosition.minus(new Point(0, 2)), Item.COIN)
    }

    private dropWeapon() {
        // TODO
    }

    private beingKnockedBack = false

    private knockback(direction: Point, knockback: number) {
        if (this.beingKnockedBack) {
            return
        }
        this.beingKnockedBack = true
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
                this.beingKnockedBack = false
            } else {
                requestAnimationFrame(knock)
            }
            last = now
        }
        requestAnimationFrame(knock)
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
    move(updateData: UpdateData, direction: Point, facingOverride: number = 0, maxDistance: number = Number.MAX_SAFE_INTEGER) {
        if (this._health <= 0) {
            return
        }

        if (this.beingKnockedBack) {
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
                this.animation.play(1)  // TODO make the run animation backwards if they run backwards :)
            }
            const translation = direction.normalized()
            // this.lerpedLastMoveDir = this.lerpedLastMoveDir.lerp(0.25, translation)
            const distance = Math.min(updateData.elapsedTimeMillis * this.speed, maxDistance)
            const newPos = this._position.plus(translation.times(distance))
            this.moveTo(newPos)
        } else if (wasMoving) {
            this.animation.play(0)
        }
    }

    moveTo(point: Point) {
        this._position = this.collider.moveTo(point.plus(this.relativeColliderPos)).minus(this.relativeColliderPos)
    }

    isFacing(pt: Point) {
        if (pt.x === this.standingPosition.x) {
            return true
        }
        return this.animation.transform.mirrorX === (pt.x < this.standingPosition.x)
    }

    getAnimationOffsetPosition(): Point {
        // magic based on the animations
        const f = this.animation.currentFrame()
        if (!this.isMoving) {
            return new Point(0, [0, 1, 2, 1][f])
        } else {
            return new Point(0, [-1, -2, -1, 0][f])
        }
    }

    save(): DudeSaveState {
        return {
            type: this.type,
            pos: this.position.toString(),
            maxHealth: this.maxHealth,
            health: this._health,
            speed: this.speed,
            weapon: this.weaponId,
            shield: this.shieldId,
            inventory: this.inventory.save(),
            dialogue: this.dialogue,
            blob: this.blob,
        }
    }

    getRenderMethods(): RenderMethod[] {
        return this.getIndicator()
    }

    private getIndicator(): RenderMethod[] {
        let indicator = DudeInteractIndicator.NONE
        if (this.dialogue) {
            indicator = getDialogue(this.dialogue).indicator
        }
        let tile: StaticTileSource = DudeInteractIndicator.getTile(indicator)
        if (!tile || this.dialogueInteract.isShowingUI) {
            return []
        } else {
            return [tile.toImageRender(new TileTransform(
                this.standingPosition.plusY(-this.animation.transform.dimensions.y).plus(new Point(1, 1).times(-TILE_SIZE/2)).plus(this.getAnimationOffsetPosition()),
                new Point(TILE_SIZE, TILE_SIZE), 0, false, false, UIStateManager.UI_SPRITE_DEPTH
            ))]
        }
    }
}