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
    speed = 0.085
    private characterAnim: AnimatedTileComponent
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
        return this.position.plus(new Point(this.characterAnim.transform.dimensions.x/2, this.characterAnim.transform.dimensions.y))
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
        this.characterAnim = this.entity.addComponent(new AnimatedTileComponent(new Point(0, 0), idleAnim, runAnim))

        if (!!this.weaponId) {
            this._weapon = this.entity.addComponent(new Weapon(this.weaponId))
        }

        const colliderSize = new Point(10, 8)
        this.relativeColliderPos = new Point(
            this.characterAnim.transform.dimensions.x/2 - colliderSize.x/2, 
            this.characterAnim.transform.dimensions.y - colliderSize.y
        )
        this.collider = this.entity.addComponent(new BoxCollider(this.position.plus(this.relativeColliderPos), colliderSize))
    }

    private beingKnockedBack = false

    damage(direction: Point, knockback: number) {
        console.log("ow!")
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

        // TODO health
    }

    move(updateData: UpdateData, direction: Point, facingLeft: () => boolean = () => direction.x < 0) {
        if (this.beingKnockedBack) {
            direction = direction.times(0)
        }

        const dx = direction.x
        const dy = direction.y

        this.characterAnim.transform.mirrorX = facingLeft()
        
        const wasMoving = this.isMoving
        this._isMoving = dx != 0 || dy != 0

        if (this.isMoving) {
            if (!wasMoving) {
                this.characterAnim.play(1)
            }
            const translation = direction.normalized()
            // this.lerpedLastMoveDir = this.lerpedLastMoveDir.lerp(0.25, translation)
            const newPos = this._position.plus(translation.times(updateData.elapsedTimeMillis * this.speed))
            this.placeAt(newPos)
        } else if (wasMoving) {
            this.characterAnim.play(0)
        }

        this.characterAnim.transform.position = this.position
        this.characterAnim.transform.depth = this.position.y + this.characterAnim.transform.dimensions.y

        if (!!this.weapon) {
            this.weapon.syncWithPlayerAnimation(this, this.characterAnim)
        }
    }

    placeAt(point: Point) {
        this._position = this.collider.moveTo(point.plus(this.relativeColliderPos)).minus(this.relativeColliderPos)
    }
}