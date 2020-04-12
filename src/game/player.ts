import { TileComponent, TileTransform, TileSetAnimation, AnimatedTileComponent } from "../engine/tileset"
import { UpdateData, StartData } from "../engine/engine"
import { InputKey } from "../engine/input"
import { Point } from "../engine/point"
import { Tile } from "./tiles"
import { RenderImage } from "../engine/renderer"
import { Entity } from "../engine/entity"
import { Component } from "../engine/component"

const instantiatePlayer = (): Entity => {

    return new Entity([
        new Player(new Point(0, 0))
    ])
}

export class Player extends Component {
    readonly speed = 1.2
    private characterAnim: TileComponent
    private swordAnim: AnimatedTileComponent

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
    }

    update(updateData: UpdateData) {
        super.update(updateData)

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
        
        this._position = new Point(
            this._position.x + dx / updateData.elapsedTimeMillis * this.speed, 
            this._position.y + dy / updateData.elapsedTimeMillis * this.speed
        )

        this.characterAnim.transform.position = this._position
        this.swordAnim.transform.position = this._position
    }
    
    /*
    getRenderImages(): RenderImage[] {
        const mirrored: TileTransform = {
            rotation: this.transform.rotation,
            scale: this.transform.scale,
            mirrorX: false,
            mirrorY: this.transform.mirrorY
        }

        return [
            this.tileSource.toRenderImage(this.transform),
            this.swordAnim.getCurrentTileSource().toRenderImage(this.transform)
        ]
    }
    */
}