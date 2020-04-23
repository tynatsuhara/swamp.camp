import { AnimatedTileComponent } from "../engine/tiles/AnimatedTileComponent"
import { TileComponent } from "../engine/tiles/TileComponent"
import { UpdateData, StartData } from "../engine/engine"
import { InputKey } from "../engine/input"
import { Point } from "../engine/point"
import { Component } from "../engine/component"
import { BoxCollider } from "../engine/collision/BoxCollider"
import { TileManager } from "./graphics/TileManager"

export class Dude extends Component {
    speed = 0.085
    private characterAnim: AnimatedTileComponent
    private archetype: string

    private swordAnim: TileComponent
    private relativeSwordPos: Point = new Point(-4, 5)

    private collider: BoxCollider
    private relativeColliderPos: Point = new Point(3, 15)
    
    private _position: Point
    get position(): Point {
        return this._position
    }
    private _isMoving: boolean
    get isMoving() {
        return this._isMoving
    }

    constructor(
        archetype: string,
        position: Point
    ) {
        super()
        this.archetype = archetype
        this._position = position
    }

    start(startData: StartData) {
        this.characterAnim = this.entity.addComponent(
            new AnimatedTileComponent(
                new Point(0, 0), 
                TileManager.instance.dungeonCharacters.getTileSetAnimation(`${this.archetype}_idle_anim`, 150),
                TileManager.instance.dungeonCharacters.getTileSetAnimation(`${this.archetype}_run_anim`, 80),
                // TileManager.instance.dungeonCharacters.getTileSetAnimation(`${this.archetype}_hit_anim`, 1000),  // TODO handle missing animation for some archetypes
            )
        )

        this.swordAnim = this.entity.addComponent(
            new TileComponent(
                TileManager.instance.dungeonCharacters.getTileSource("weapon_rusty_sword")
            )
        )
        
        this.collider = this.entity.addComponent(new BoxCollider(this.position.plus(this.relativeColliderPos), new Point(10, 12)))
    }

    move(updateData: UpdateData, direction: Point) {
        const dx = direction.x
        const dy = direction.y

        if (dx < 0) {
            this.characterAnim.transform.mirrorX = true
        } else if (dx > 0) {
            this.characterAnim.transform.mirrorX = false
        }
        
        const wasMoving = this.isMoving
        this._isMoving = dx != 0 || dy != 0

        if (this.isMoving) {
            if (!wasMoving) {
                this.characterAnim.play(1)
            }
            const translation = direction.normalized()
            // this.lerpedLastMoveDir = this.lerpedLastMoveDir.lerp(0.25, translation)
            const newPos = this._position.plus(translation.times(updateData.elapsedTimeMillis * this.speed))
            this._position = this.collider.moveTo(newPos.plus(this.relativeColliderPos)).minus(this.relativeColliderPos)
        } else if (wasMoving) {
            this.characterAnim.play(0)
        }

        this.characterAnim.transform.position = this.position
        this.characterAnim.transform.depth = this.position.y

        this.updateSwordPos()
    }

    private updateSwordPos() {
        if (!!this.swordAnim) {
            // magic based on the animations
            let pos = this.relativeSwordPos
            const f = this.characterAnim.currentFrame()
            if (!this.isMoving) {
                pos = pos.plus(new Point(0, f == 3 ? 1 : f))
            } else {
                pos = pos.plus(new Point(0, f == 0 ? -1 : -((3 - this.characterAnim.currentFrame()))))
            }

            this.swordAnim.transform.position = this.position.plus(pos)
            // show sword behind if mirrored
            this.swordAnim.transform.depth = this.characterAnim.transform.depth - (this.characterAnim.transform.mirrorX ? 1 : 0)
        }
    }
}