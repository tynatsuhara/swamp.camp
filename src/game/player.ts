import { TileEntity, TileTransform, TileSetAnimator, TileSetAnimation } from "../engine/tileset"
import { UpdateData } from "../engine/engine"
import { InputKey } from "../engine/input"
import { Point } from "../engine/point"
import { Tile } from "./tiles"
import { RenderImage } from "../engine/renderer"

export class Player extends TileEntity {
    readonly speed = 1.2

    swordAnim: TileSetAnimator = new TileSetAnimator(new TileSetAnimation([
        [Tile.SWORD_1, 500],
        [Tile.ARC, 100]
    ]))

    update(updateData: UpdateData) {
        let dx = 0
        let dy = 0

        if (updateData.input.isKeyHeld(InputKey.W)) { dy-- }
        if (updateData.input.isKeyHeld(InputKey.S)) { dy++ }
        if (updateData.input.isKeyHeld(InputKey.A)) { dx-- }
        if (updateData.input.isKeyHeld(InputKey.D)) { dx++ }

        if (dx < 0) {
            this.transform.mirrorX = true
        } else if (dx > 0) {
            this.transform.mirrorX = false
        }
        
        this.position = new Point(
            this.position.x + dx / updateData.elapsedTimeMillis * this.speed, 
            this.position.y + dy / updateData.elapsedTimeMillis * this.speed
        )

        // TODO: figure out how to structure components so that we can have a sword, shield, etc with animations
        this.swordAnim.update(updateData.elapsedTimeMillis)
    }

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
}