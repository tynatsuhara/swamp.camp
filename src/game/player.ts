import { TileComponent, TileTransform, TileSetAnimation, AnimatedTileComponent } from "../engine/tileset"
import { UpdateData, StartData } from "../engine/engine"
import { InputKey } from "../engine/input"
import { Point } from "../engine/point"
import { Tile, TILE_SIZE } from "./tiles"
import { ImageRender } from "../engine/renderer/ImageRender"
import { Entity } from "../engine/entity"
import { Component } from "../engine/component"
import { BoxCollider } from "../engine/collision"

const instantiatePlayer = (): Entity => {

    return new Entity([
        new Player(new Point(0, 0))
    ])
}

export class Player extends Component {
    readonly speed = 0.07
    private characterAnim: TileComponent
    private swordAnim: AnimatedTileComponent
    private collider: BoxCollider

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
            [Tile.ARC, 100]
        ])))
        this.collider = this.entity.addComponent(new BoxCollider(this.position, new Point(TILE_SIZE, TILE_SIZE)))
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
        
        const newPos = new Point(
            this._position.x + dx * updateData.elapsedTimeMillis * this.speed, 
            this._position.y + dy * updateData.elapsedTimeMillis * this.speed
        )
        this._position = this.collider.moveTo(newPos)

        this.characterAnim.transform.position = this._position
        this.swordAnim.transform.position = this._position
    }
}