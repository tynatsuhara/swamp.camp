import { KeyPressIndicator } from "./KeyPressIndicator"
import { Point } from "brigsby/dist/Point"
import { InputKey } from "brigsby/dist/Input"
import { TILE_SIZE, Tilesets } from "../graphics/Tilesets"
import { SpriteTransform } from "brigsby/dist/sprites/SpriteTransform"
import { formatText } from "./Text"
import { Color } from "./Color"
import { RenderMethod } from "brigsby/dist/renderer/RenderMethod"
import { UIStateManager } from "./UIStateManager"
import { Controls } from "../Controls"

export const makeControlsUI = (dimensions: Point, offset: Point): RenderMethod[] => {
    const topLeft = new Point(dimensions.x/2 - TILE_SIZE*6 - 1, dimensions.y/2 - TILE_SIZE*5).plus(offset)
    const controlsOffset = 5
    const dashOffset = TILE_SIZE * 5-4

    return [
        ...new KeyPressIndicator(topLeft.plusX(TILE_SIZE), Controls.walkUp).getRenderMethods(),
        ...new KeyPressIndicator(topLeft.plusY(TILE_SIZE), Controls.walkLeft).getRenderMethods(),
        ...new KeyPressIndicator(topLeft.plusX(TILE_SIZE).plusY(TILE_SIZE), Controls.walkDown).getRenderMethods(),
        ...new KeyPressIndicator(topLeft.plusX(TILE_SIZE * 2).plusY(TILE_SIZE), Controls.walkRight).getRenderMethods(),
        // ...new KeyPressIndicator(topLeft.plusX(TILE_SIZE * 4 - 2).plusY(controlsOffset), Controls.attackKey).getRenderMethods(),
        // ...new KeyPressIndicator(topLeft.plusX(TILE_SIZE * 4 - 2).plusY(controlsOffset + TILE_SIZE), Controls.blockKey).getRenderMethods(),
        Tilesets.instance.oneBit.getTileSource("leftClick").toImageRender(new SpriteTransform(topLeft.plusX(TILE_SIZE*4).plusY(controlsOffset))),
        Tilesets.instance.oneBit.getTileSource("rightClick").toImageRender(new SpriteTransform(topLeft.plusX(TILE_SIZE*4).plusY(TILE_SIZE * 1 + controlsOffset))),
        ...formatText("MOVE", Color.WHITE, topLeft.plusX(TILE_SIZE/2).plusY(TILE_SIZE*2+2), 100),
        ...formatText("ATTACK", Color.WHITE, topLeft.plusX(TILE_SIZE*5).plusY(4 + controlsOffset), 100),
        ...formatText("BLOCK", Color.WHITE, topLeft.plusX(TILE_SIZE*5).plusY(TILE_SIZE + 4 + controlsOffset), 100),
        ...formatText("[SPACE]", Color.WHITE, topLeft.plusX(TILE_SIZE*4 + dashOffset).plusY(4 + controlsOffset + 3), 100),
        ...formatText("DASH", Color.WHITE, topLeft.plusX(TILE_SIZE*4.75 + dashOffset).plusY(TILE_SIZE + 4 + controlsOffset - 3), 100),
    ].map(r => {
        r.depth = UIStateManager.UI_SPRITE_DEPTH
        return r
    })
}