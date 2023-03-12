import { Point, pt } from "brigsby/dist"
import { SpriteTransform } from "brigsby/dist/sprites/SpriteTransform"
import { ImageFilters } from "../graphics/ImageFilters"
import { Icon } from "../graphics/OneBitTileset"
import { Tilesets, TILE_SIZE } from "../graphics/Tilesets"
import { Color } from "./Color"
import { UIStateManager } from "./UIStateManager"

const iconSpriteCache = {}

export const getIconSprite = (icon: Icon, centerPos: Point, color: Color = Color.WHITE) => {
    const cacheKey = `${icon}${color ?? ""}`
    const sprite =
        iconSpriteCache[cacheKey] ??
        Tilesets.instance.oneBit
            .getTileSource(icon)
            .filtered(color !== Color.WHITE ? ImageFilters.tint(color) : undefined)
    iconSpriteCache[cacheKey] = sprite
    return sprite.toImageRender(
        new SpriteTransform(
            centerPos.plus(new Point(1, 1).times(-TILE_SIZE / 2)),
            pt(TILE_SIZE),
            0,
            false,
            false,
            UIStateManager.UI_SPRITE_DEPTH
        )
    )
}
