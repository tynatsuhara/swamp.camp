import { AnimatedTileComponent } from "../../engine/tiles/AnimatedTileComponent"
import { UpdateData } from "../../engine/engine"
import { Point } from "../../engine/point"
import { Component } from "../../engine/component"
import { BoxCollider } from "../../engine/collision/BoxCollider"
import { Tilesets } from "../graphics/Tilesets"
import { Weapon } from "./Weapon"
import { Inventory } from "../items/Inventory"
import { spawnItem, Items } from "../items/Items"
import { DudeType } from "./DudeFactory"
import { Shield } from "./Shield"
import { TileTransform } from "../../engine/tiles/TileTransform"

export class Dude extends Component {

    static readonly COLLISION_LAYER = "dube"
    
    readonly type: DudeType
    readonly inventory = new Inventory()
    readonly maxHealth = 4
    private _health = this.maxHealth
    get health() { return this._health }
    speed = 0.085
    private _animation: AnimatedTileComponent
    get animation() { return this._animation }

    private _weapon: Weapon
    get weapon() { return this._weapon }
    private _shield: Shield
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

    constructor(
        type: DudeType,
        characterAnimName: string,
        position: Point,
        weaponId: string
    ) {
        super()
        this.type = type
        this._position = position

        this.start = (startData) => {
            const idleAnim = Tilesets.instance.dungeonCharacters.getTileSetAnimation(`${characterAnimName}_idle_anim`, 150)
            const runAnim = Tilesets.instance.dungeonCharacters.getTileSetAnimation(`${characterAnimName}_run_anim`, 80)

            const height = idleAnim.getTile(0).dimensions.y
            
            this._animation = this.entity.addComponent(new AnimatedTileComponent([idleAnim, runAnim], new TileTransform(new Point(0, 28-height))))
    
            if (!!weaponId) {
                this._weapon = this.entity.addComponent(new Weapon(weaponId))
            }
    
            const colliderSize = new Point(10, 8)
            this.relativeColliderPos = new Point(
                this.animation.transform.dimensions.x/2 - colliderSize.x/2, 
                this.animation.transform.dimensions.y - colliderSize.y
            )
            this.collider = this.entity.addComponent(new BoxCollider(this.position.plus(this.relativeColliderPos), colliderSize, Dude.COLLISION_LAYER))



            // TODO MOVE THIS TO THE FACTORY
            this._shield = this.entity.addComponent(new Shield("shield_2"))
        }
    }

    update(updateData: UpdateData) {
        // All other transforms (eg the weapon) are positioned relative to the animation
        this.animation.transform.position = this.position.plus(this.isAlive ? new Point(0, 0) : this.deathOffset)

        this.animation.transform.depth = this.collider.position.y + this.collider.dimensions.y
    }

    get isAlive() { return this._health > 0 }

    damage(damage: number, direction: Point, knockback: number) {
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
        spawnItem(this.standingPosition.minus(new Point(0, 2)), Items.COIN)
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
        // TODO debug the glitchyness of this movement, try requestAnimationFrame
        const interval = setInterval(() => {
            this.moveTo(this.position.lerp(.15, goal))
            intervalsRemaining--
            if (intervalsRemaining === 0 || goal.minus(this.position).magnitude() < distToStop) {
                clearInterval(interval)
                this.beingKnockedBack = false
            }
        }, 10)
    }

    heal(amount: number) {
        if (this.isAlive) {
            this._health = Math.min(this.maxHealth, this.health + amount)
        }
    }

    /**
     * Should be called on EVERY update step for 
     * @param updateData 
     * @param direction the direction they are moving in
     * @param facingOverride if < 0, will face left, if > 0, will face right. if == 0, will face the direction they're moving
     */
    move(updateData: UpdateData, direction: Point, facingOverride: number = 0) {
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
            const newPos = this._position.plus(translation.times(updateData.elapsedTimeMillis * this.speed))
            this.moveTo(newPos)
        } else if (wasMoving) {
            this.animation.play(0)
        }
    }

    private moveTo(point: Point) {
        this._position = this.collider.moveTo(point.plus(this.relativeColliderPos)).minus(this.relativeColliderPos)
    }

    isFacing(pt: Point) {
        return this.animation.transform.mirrorX === (pt.x < this.standingPosition.x)
    }

    getAnimationOffsetPosition(): Point {
        // magic based on the animations
        const f = this.animation.currentFrame()
        if (!this.isMoving) {
            return new Point(0, f == 3 ? 1 : f)
        } else {
            return new Point(0, f == 0 ? -1 : -((3 - this.animation.currentFrame())))
        }
    }
}