import { Point, pt } from "brigsby/dist"
import { SpriteTransform } from "brigsby/dist/sprites/SpriteTransform"
import { ImageFilters } from "../graphics/ImageFilters"
import { Tilesets, TILE_SIZE } from "../graphics/Tilesets"
import { Color } from "./Color"
import { UIStateManager } from "./UIStateManager"

const getIcon = (indicator: InteractIndicator) => {
    switch (indicator) {
        case InteractIndicator.NONE:
            return null
        case InteractIndicator.IMPORTANT_DIALOGUE:
            return Tilesets.instance.oneBit.getTileAt(new Point(19, 25))
        case InteractIndicator.QUESTION:
            return Tilesets.instance.oneBit.getTileAt(new Point(21, 25))
        case InteractIndicator.ATTACKING_SOON:
            return Tilesets.instance.oneBit.getTileAt(new Point(27, 20))
        case InteractIndicator.ATTACKING_NOW:
            return Tilesets.instance.oneBit
                .getTileAt(new Point(27, 20))
                .filtered(ImageFilters.tint(Color.RED_4))
    }
}

const cache = {}

export const getInteractIndicatorIcon = (indicator: InteractIndicator, centerPos: Point) => {
    if (indicator === InteractIndicator.NONE) {
        return null
    }
    const tile = cache[indicator] || getIcon(indicator)
    cache[indicator] = tile
    return tile.toImageRender(
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

export enum InteractIndicator {
    NONE,
    IMPORTANT_DIALOGUE,
    QUESTION,
    // not really interact indicators but displayed in the same UI system
    ATTACKING_SOON,
    ATTACKING_NOW,
}
