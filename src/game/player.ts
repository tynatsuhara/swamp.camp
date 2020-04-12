import { TileComponent, TileTransform, TileSetAnimation, AnimatedTileComponent } from "../engine/tileset"
import { UpdateData } from "../engine/engine"
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

    characterAnim: TileComponent
    swordAnim: AnimatedTileComponent

    constructor(pos: Point) {
        super()
        this.characterAnim = this.entity.addComponent(new TileComponent(Tile.GUY_1, pos))
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
        
        this.characterAnim.transform.position = new Point(
            this.characterAnim.transform.position.x + dx / updateData.elapsedTimeMillis * this.speed, 
            this.characterAnim.transform.position.y + dy / updateData.elapsedTimeMillis * this.speed
        )
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