import { Entity, pt } from "brigsby/dist"
import { BasicRenderComponent } from "brigsby/dist/renderer"
import { SpriteTransform } from "brigsby/dist/sprites"
import { Tilesets } from "../../graphics/Tilesets"

export const sprite = ({
    key,
    pixelX,
    pixelY,
    rotation = 0,
    depth = 0,
}: {
    key: string
    pixelX: number
    pixelY: number
    rotation?: number
    depth?: number
}) => {
    const tile = Tilesets.instance.getBasicTileSource(key)
    return new Entity([
        new BasicRenderComponent(
            tile.toImageRender(
                SpriteTransform.new({
                    position: pt(pixelX, pixelY),
                    rotation,
                    depth,
                })
            )
        ),
    ])
}
