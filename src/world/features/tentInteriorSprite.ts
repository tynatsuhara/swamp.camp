import { Entity, pt } from "brigsby/dist"
import { BasicRenderComponent } from "brigsby/dist/renderer"
import { SpriteTransform } from "brigsby/dist/sprites"
import { TILE_SIZE, Tilesets } from "../../graphics/Tilesets"
import { TentColor, getTentVariantImageFilter } from "../../items/TentVariants"

export const tentInteriorSprite = ({ color }: { color: TentColor }) => {
    const render = Tilesets.instance.largeSprites
        .getTileSource("tent-interior")
        .filtered(getTentVariantImageFilter(color))
        .toImageRender(
            SpriteTransform.new({
                position: pt(0, -TILE_SIZE * 3),
                depth: Number.MIN_SAFE_INTEGER,
            })
        )
    return new Entity([new BasicRenderComponent(render)])
}
