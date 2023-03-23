import { Point, pt } from "brigsby/dist"
import { SpriteTransform } from "brigsby/dist/sprites/SpriteTransform"
import { StaticSpriteSource } from "brigsby/dist/sprites/StaticSpriteSource"
import { ImageFilters } from "../graphics/ImageFilters"
import { Icon } from "../graphics/OneBitTileset"
import { Tilesets, TILE_SIZE } from "../graphics/Tilesets"
import { Color } from "./Color"
import { UI_SPRITE_DEPTH } from "./UiConstants"

const iconSpriteCache: Record<string, StaticSpriteSource> = {}

export const getIconSprite = ({ icon, color = Color.WHITE }: { icon: Icon; color?: Color }) => {
    const cacheKey = `${icon}${color ?? ""}`
    const sprite =
        iconSpriteCache[cacheKey] ??
        Tilesets.instance.oneBit
            .getTileSource(icon)
            .filtered(color !== Color.WHITE ? ImageFilters.tint(color) : undefined)
    iconSpriteCache[cacheKey] = sprite
    return sprite
}

export const getIconSpriteImageRender = ({
    icon,
    centerPos,
    color = Color.WHITE,
    depth = UI_SPRITE_DEPTH,
}: {
    icon: Icon
    centerPos: Point
    color?: Color
    depth?: number
}) => {
    return getIconSprite({ icon, color }).toImageRender(
        new SpriteTransform(
            centerPos.plus(new Point(1, 1).times(-TILE_SIZE / 2)),
            pt(TILE_SIZE),
            0,
            false,
            false,
            depth
        )
    )
}
