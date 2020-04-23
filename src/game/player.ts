import { AnimatedTileComponent } from "../engine/tiles/AnimatedTileComponent"
import { TileSetAnimation } from "../engine/tiles/TileSetAnimation"
import { TileComponent } from "../engine/tiles/TileComponent"
import { UpdateData, StartData } from "../engine/engine"
import { InputKey } from "../engine/input"
import { Point } from "../engine/point"
import { Component } from "../engine/component"
import { BoxCollider } from "../engine/collision/BoxCollider"
import { Interactable } from "./Interactable"
import { TILE_SIZE, TileManager } from "./graphics/TileManager"

export class Player extends Component {
    readonly speed = 0.085
    private characterAnim: AnimatedTileComponent
    private swordAnim: AnimatedTileComponent

    private collider: BoxCollider
    private relativeColliderPos: Point = new Point(3, 15)
    
    private crosshairs: TileComponent
    private lerpedLastMoveDir: Point = new Point(1, 0)  // used for crosshair

    private _position: Point
    get position(): Point {
        return this._position
    }
    private isMoving: boolean

    constructor(position: Point) {
        super()
        this._position = position
    }

    start(startData: StartData) {
        // TODO make animations triggerable so we can switch between run and idle
        this.characterAnim = this.entity.addComponent(
            new AnimatedTileComponent(
                new Point(0, 0), 
                TileManager.instance.dungeonCharacters.getTileSetAnimation("knight_f_idle_anim", 150),
                TileManager.instance.dungeonCharacters.getTileSetAnimation("knight_f_run_anim", 80),
                TileManager.instance.dungeonCharacters.getTileSetAnimation("knight_f_hit_anim", 1000),
            )
        )
        
        // this.swordAnim = this.entity.addComponent(new AnimatedTileComponent(new TileSetAnimation([
        //     [Tile.SWORD_1, 500],
        //     // [Tile.ARC, 100]
        // ])))
        this.collider = this.entity.addComponent(new BoxCollider(this.position.plus(this.relativeColliderPos), new Point(10, 12)))
        // this.crosshairs = this.entity.addComponent(new TileComponent(Tile.CROSSHAIRS))
    }

    update(updateData: UpdateData) {
        // const originalCrosshairPosRelative = this.crosshairs.transform.position.minus(this.position)

        this.move(updateData)

        // update crosshair position
        // const relativeLerpedPos = originalCrosshairPosRelative.lerp(0.16, this.lerpedLastMoveDir.normalized().times(TILE_SIZE))
        // this.crosshairs.transform.position = this.position.plus(relativeLerpedPos)
        // const crosshairTilePosition = this.crosshairs.transform.position.plus(new Point(TILE_SIZE, TILE_SIZE).div(2)).floorDiv(TILE_SIZE)

        // if (updateData.input.isKeyDown(InputKey.F)) {
        //     game.tiles.remove(crosshairTilePosition)
        // }

        // if (updateData.input.isKeyDown(InputKey.E)) {
        //     game.tiles.get(crosshairTilePosition)?.getComponent(Interactable)?.interact()
        // }
    }

    private move(updateData: UpdateData) {
        let dx = 0
        let dy = 0

        if (updateData.input.isKeyHeld(InputKey.W)) { dy-- }
        if (updateData.input.isKeyHeld(InputKey.S)) { dy++ }
        if (updateData.input.isKeyHeld(InputKey.A)) { dx-- }
        if (updateData.input.isKeyHeld(InputKey.D)) { dx++ }

        if (dx < 0) {
            this.characterAnim.transform.mirrorX = true
        } else if (dx > 0) {
            this.characterAnim.transform.mirrorX = false
        }
        // this.swordAnim.transform.mirrorX = this.characterAnim.transform.mirrorX
        
        const wasMoving = this.isMoving
        this.isMoving = dx != 0 || dy != 0

        if (this.isMoving) {
            if (!wasMoving) {
                this.characterAnim.play(1)
            }
            const translation = new Point(dx, dy).normalized()
            this.lerpedLastMoveDir = this.lerpedLastMoveDir.lerp(0.25, translation)
            const newPos = this._position.plus(translation.times(updateData.elapsedTimeMillis * this.speed))
            this._position = this.collider.moveTo(newPos.plus(this.relativeColliderPos)).minus(this.relativeColliderPos)
        } else if (wasMoving) {
            this.characterAnim.play(0)
        }

        this.characterAnim.transform.position = this.position
        // this.swordAnim.transform.position = this.position
    }
}