import { TileEntity } from "../engine/tileset"
import { UpdateData } from "../engine/engine"
import { InputKey } from "../engine/input"
import { Point } from "../engine/point"

export class Player extends TileEntity {
    readonly speed = 1.2

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
    }
}