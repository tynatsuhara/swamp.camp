import { AnimatedTileComponent } from "../../engine/tiles/AnimatedTileComponent"
import { TileComponent } from "../../engine/tiles/TileComponent"
import { UpdateData, StartData } from "../../engine/engine"
import { InputKey } from "../../engine/input"
import { Point } from "../../engine/point"
import { Component } from "../../engine/component"
import { BoxCollider } from "../../engine/collision/BoxCollider"
import { TileManager } from "../graphics/TileManager"
import { Weapon } from "./Weapon"

export class Dude extends Component {

    private health = 5
    speed = 0.085
    private _animation: AnimatedTileComponent
    get animation() { return this._animation }
    private archetype: string

    private readonly weaponId: string
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
        this.archetype = archetype
        this._position = position
        this.weaponId = weaponId
    }

    start(startData: StartData) {
        const idleAnim = TileManager.instance.dungeonCharacters.getTileSetAnimation(`${this.archetype}_idle_anim`, 150)
        const runAnim = TileManager.instance.dungeonCharacters.getTileSetAnimation(`${this.archetype}_run_anim`, 80)
        // TileManager.instance.dungeonCharacters.getTileSetAnimation(`${this.archetype}_hit_anim`, 1000),  // TODO handle missing animation for some archetypes
        
        this._animation = this.entity.addComponent(new AnimatedTileComponent(new Point(0, 0), idleAnim, runAnim))

        if (!!this.weaponId) {
            this._weapon = this.entity.addComponent(new Weapon(this.weaponId))
        }

        const colliderSize = new Point(10, 8)
        this.relativeColliderPos = new Point(
            this.animation.transform.dimensions.x/2 - colliderSize.x/2, 
            this.animation.transform.dimensions.y - colliderSize.y
        )
        this.collider = this.entity.addComponent(new BoxCollider(this.position.plus(this.relativeColliderPos), colliderSize))
    }

    update(updateData: UpdateData) {
        if (this.health > 0) {
            this.animation.transform.position = this.position
            this.animation.transform.depth = this.position.y + this.animation.transform.dimensions.y
        } else {
            this.animation.transform.position = this.position.plus(this.deathOffset)
            this.animation.transform.depth = this.position.y + this.animation.transform.dimensions.x
        }

        this.animation.transform.depth = this.collider.position.y + this.collider.dimensions.y

        // if (!!this.weapon) {
        //     this.weapon.syncWithCharacterAnimation(this, this.characterAnim)
        // }
    }

    private beingKnockedBack = false
    get isAlive() { return this.health !== 0 }

    damage(damage: number, direction: Point, knockback: number) {
        if (this.isAlive) {
            if (this.health-damage <= 0) {
                this.die(direction)
                knockback *= (1 + Math.random())
            } else {
                this.health -= damage
            }
        }

        this.knockback(direction, knockback)
    }

    private deathOffset: Point
    die(direction: Point = new Point(-1, 0)) {
        if (this.health === 0) {
            return
        }
        this.health = 0
        this.dropWeapon()
        const prePos = this.animation.transform.position
        this.animation.transform.rotate(90 * Math.sign(direction.x), this.standingPosition.minus(new Point(0, 5)))
        this.deathOffset = this.animation.transform.position.minus(prePos)
        this.animation.play(0)
        this.animation.paused = true
    }

    dropWeapon() {
        // TODO
    }

    private knockback(direction: Point, knockback: number) {
        this.beingKnockedBack = true
        const goal = this.position.plus(direction.normalized().times(knockback))
        let intervalsRemaining = 50
        const interval = setInterval(() => {
            this.placeAt(this.position.lerp(.07, goal))
            intervalsRemaining--
            if (intervalsRemaining === 0 || goal.minus(this.position).magnitude() < 2) {
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
        if (this.health <= 0) {
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
            this.placeAt(newPos)
        } else if (wasMoving) {
            this.animation.play(0)
        }
    }

    placeAt(point: Point) {
        this._position = this.collider.moveTo(point.plus(this.relativeColliderPos)).minus(this.relativeColliderPos)
    }
}