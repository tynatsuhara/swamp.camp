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

export class Player extends Component {
    readonly speed = 0.07
    private characterAnim: TileComponent
    private swordAnim: AnimatedTileComponent
    private collider: BoxCollider
    private crosshairs: TileComponent
    private lastMoveDir: Point = new Point(1, 0)

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
        
        const isMoving = dx != 0 || dy != 0

        if (isMoving) {
            const newPos = new Point(
                this._position.x + dx * updateData.elapsedTimeMillis * this.speed, 
                this._position.y + dy * updateData.elapsedTimeMillis * this.speed
            )
            this._position = this.collider.moveTo(newPos)
            this.lastMoveDir = new Point(dx, dy)
        }

        this.characterAnim.transform.position = this.position
        this.swordAnim.transform.position = this.position
        this.crosshairs.transform.position = this.crosshairs.transform.position.lerp(0.4, this.position.plus(this.lastMoveDir.times(TILE_SIZE)))

        if (updateData.input.isKeyDown(InputKey.F)) {
            const cursorPos = this.crosshairs.transform.position
            game.tiles.remove(this.crosshairs.transform.position.plus(new Point(TILE_SIZE, TILE_SIZE).div(2)).floorDiv(TILE_SIZE))
        }
    }
}