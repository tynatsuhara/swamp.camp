import { AnimatedTileComponent } from "../../engine/tiles/AnimatedTileComponent"
import { UpdateData } from "../../engine/engine"
import { Point } from "../../engine/point"
import { Component } from "../../engine/component"
import { BoxCollider } from "../../engine/collision/BoxCollider"
import { Tilesets } from "../graphics/Tilesets"
import { Weapon } from "./Weapon"
import { Entity } from "../../engine/Entity"
import { Coin } from "../items/Coin"
import { Inventory } from "../items/Inventory"
import { LocationManager } from "../world/LocationManager"

export class Dude extends Component {

    static readonly COLLISION_LAYER = "dube"
    
    readonly inventory = new Inventory()
    readonly maxHealth = 4
    private _health = this.maxHealth
    get health() { return this._health }
    speed = 0.085
    private _animation: AnimatedTileComponent
    get animation() { return this._animation }

    private _weapon: Weapon
    get weapon() {
        return this._weapon
    }

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
        archetype: string,
        position: Point,
        weaponId: string
    ) {
        super()
        this._position = position
        this.start = (startData) => {
            const idleAnim = Tilesets.instance.dungeonCharacters.getTileSetAnimation(`${archetype}_idle_anim`, 150)
            const runAnim = Tilesets.instance.dungeonCharacters.getTileSetAnimation(`${archetype}_run_anim`, 80)
            
            this._animation = this.entity.addComponent(new AnimatedTileComponent([idleAnim, runAnim]))
    
            if (!!weaponId) {
                this._weapon = this.entity.addComponent(new Weapon(weaponId))
            }
    
            const colliderSize = new Point(10, 8)
            this.relativeColliderPos = new Point(
                this.animation.transform.dimensions.x/2 - colliderSize.x/2, 
                this.animation.transform.dimensions.y - colliderSize.y
            )
            this.collider = this.entity.addComponent(new BoxCollider(this.position.plus(this.relativeColliderPos), colliderSize, Dude.COLLISION_LAYER))
        }
    }

    update(updateData: UpdateData) {
        // All other transforms (eg the weapon) are positioned relative to the animation
        this.animation.transform.position = this.position.plus(this.isAlive ? new Point(0, 0) : this.deathOffset)

        this.animation.transform.depth = this.collider.position.y + this.collider.dimensions.y
    }

    get isAlive() { return this._health > 0 }

    damage(damage: number, direction: Point, knockback: number) {
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
        LocationManager.instance.currentLocation.dynamic.add(new Entity([new Coin(this.standingPosition.minus(new Point(0, 2)))]))
    }

    private dropWeapon() {
        // TODO
    }

    private beingKnockedBack = false

    private knockback(direction: Point, knockback: number) {
        this.beingKnockedBack = true
        const goal = this.position.plus(direction.normalized().times(knockback))
        const distToStop = 2
        let intervalsRemaining = 50
        const interval = setInterval(() => {
            this.moveTo(this.position.lerp(.07, goal))
            intervalsRemaining--
            if (intervalsRemaining === 0 || goal.minus(this.position).magnitude() < distToStop) {
                clearInterval(interval)
                this.beingKnockedBack = false
            }
        }, 10)
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
}