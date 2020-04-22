import { AnimatedTileComponent } from "../engine/tiles/AnimatedTileComponent"
import { TileSetAnimation } from "../engine/tiles/TileSetAnimation"
import { TileComponent } from "../engine/tiles/TileComponent"
import { UpdateData, StartData } from "../engine/engine"
import { InputKey } from "../engine/input"
import { Point } from "../engine/point"
import { Tile, TILE_SIZE } from "./tiles"
import { Component } from "../engine/component"
import { BoxCollider } from "../engine/collision/BoxCollider"
import { game } from "./quest_game"
import { Interactable } from "./Interactable"

export class Player extends Component {
    readonly speed = 0.075
    private characterAnim: TileComponent
    private swordAnim: AnimatedTileComponent
    private collider: BoxCollider
    private crosshairs: TileComponent
    private lerpedLastMoveDir: Point = new Point(1, 0)  // used for crosshair

    private _position: Point
    get position(): Point {
        return this._position
    }

    constructor(position: Point) {
        super()
        this._position = position
    }

    start(startData: StartData) {
        this.characterAnim = this.entity.addComponent(new TileComponent(Tile.GUY_1))
        this.swordAnim = this.entity.addComponent(new AnimatedTileComponent(new TileSetAnimation([
            [Tile.SWORD_1, 500],
            // [Tile.ARC, 100]
        ])))
        this.collider = this.entity.addComponent(new BoxCollider(this.position, new Point(TILE_SIZE, TILE_SIZE)))
        this.crosshairs = this.entity.addComponent(new TileComponent(Tile.CROSSHAIRS))
    }

    update(updateData: UpdateData) {
        const originalCrosshairPosRelative = this.crosshairs.transform.position.minus(this.position)

        this.move(updateData)

        // update crosshair position
        const relativeLerpedPos = originalCrosshairPosRelative.lerp(0.16, this.lerpedLastMoveDir.normalized().times(TILE_SIZE))
        this.crosshairs.transform.position = this.position.plus(relativeLerpedPos)
        const crosshairTilePosition = this.crosshairs.transform.position.plus(new Point(TILE_SIZE, TILE_SIZE).div(2)).floorDiv(TILE_SIZE)

        if (updateData.input.isKeyDown(InputKey.F)) {
            game.tiles.remove(crosshairTilePosition)
        }

        if (updateData.input.isKeyDown(InputKey.E)) {
            game.tiles.get(crosshairTilePosition)?.getComponent(Interactable)?.interact()
        }
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
        this.swordAnim.transform.mirrorX = this.characterAnim.transform.mirrorX
        
        const isMoving = dx != 0 || dy != 0

        if (isMoving) {
            const translation = new Point(dx, dy)
            this.lerpedLastMoveDir = this.lerpedLastMoveDir.lerp(0.25, translation)
            const newPos = this._position.plus(translation.times(updateData.elapsedTimeMillis * this.speed))
            this._position = this.collider.moveTo(newPos)
        }

        this.characterAnim.transform.position = this.position
        this.swordAnim.transform.position = this.position
    }
}