import { Point } from "brigsby/dist/Point"
import { RenderMethod } from "brigsby/dist/renderer/RenderMethod"
import { SpriteTransform } from "brigsby/dist/sprites/SpriteTransform"
import { Controls } from "../Controls"
import { Tilesets, TILE_SIZE } from "../graphics/Tilesets"
import { Color } from "./Color"
import { KeyPressIndicator } from "./KeyPressIndicator"
import { formatText } from "./Text"

/**
 * Controls that need to be shown here:
 *   - Attack
 *   - Block
 *   - Jump
 *   - Roll
 *   - Move
 *   - Inventory
 *   - Map
 *   - Sheath weapon
 */

export const makeControlsUI = (dimensions: Point, offset: Point): RenderMethod[] => {
    const topLeft = new Point(
        dimensions.x / 2 - TILE_SIZE * 6 - 1,
        dimensions.y / 2 - TILE_SIZE * 6
    ).plus(offset)
    const controlsOffset = 5
    const dashOffset = TILE_SIZE * 5 - 4

    const format = (text: string, position: Point) =>
        formatText({
            text,
            color: Color.WHITE,
            position,
            width: 100,
        })

    return [
        ...new KeyPressIndicator(topLeft.plusX(TILE_SIZE), Controls.walkUp).getRenderMethods(),
        ...new KeyPressIndicator(topLeft.plusY(TILE_SIZE), Controls.walkLeft).getRenderMethods(),
        ...new KeyPressIndicator(
            topLeft.plusX(TILE_SIZE).plusY(TILE_SIZE),
            Controls.walkDown
        ).getRenderMethods(),
        ...new KeyPressIndicator(
            topLeft.plusX(TILE_SIZE * 2).plusY(TILE_SIZE),
            Controls.walkRight
        ).getRenderMethods(),
        // ...new KeyPressIndicator(topLeft.plusX(TILE_SIZE * 4 - 2).plusY(controlsOffset), Controls.attackKey).getRenderMethods(),
        // ...new KeyPressIndicator(topLeft.plusX(TILE_SIZE * 4 - 2).plusY(controlsOffset + TILE_SIZE), Controls.blockKey).getRenderMethods(),
        Tilesets.instance.oneBit
            .getTileSource("leftClick")
            .toImageRender(new SpriteTransform(topLeft.plusX(TILE_SIZE * 4).plusY(controlsOffset))),
        Tilesets.instance.oneBit
            .getTileSource("rightClick")
            .toImageRender(
                new SpriteTransform(
                    topLeft.plusX(TILE_SIZE * 4).plusY(TILE_SIZE * 1 + controlsOffset)
                )
            ),
        ...format("MOVE", topLeft.plusX(TILE_SIZE / 2).plusY(TILE_SIZE * 2 + 2)),
        ...format("ATTACK", topLeft.plusX(TILE_SIZE * 5).plusY(4 + controlsOffset)),
        ...format("BLOCK", topLeft.plusX(TILE_SIZE * 5).plusY(TILE_SIZE + 4 + controlsOffset)),
        ...format(
            "[SPACE]",
            topLeft.plusX(TILE_SIZE * 4 + dashOffset).plusY(4 + controlsOffset + 3)
        ),
        ...format(
            "DASH",
            topLeft.plusX(TILE_SIZE * 4.75 + dashOffset).plusY(TILE_SIZE + 4 + controlsOffset - 3)
        ),
    ]
}
