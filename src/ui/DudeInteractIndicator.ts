import { Point } from "brigsby/dist/Point"
import { StaticSpriteSource } from "brigsby/dist/sprites/StaticSpriteSource"
import { ImageFilters } from "../graphics/ImageFilters"
import { Tilesets } from "../graphics/Tilesets"
import { Color } from "./Color"

const getIcon = (indicator: string) => {
    switch (indicator) {
        case DudeInteractIndicator.NONE:
            return null
        case DudeInteractIndicator.IMPORTANT_DIALOGUE:
            return Tilesets.instance.oneBit.getTileAt(new Point(19, 25))
        case DudeInteractIndicator.ATTACKING_SOON:
            return Tilesets.instance.oneBit.getTileAt(new Point(27, 20))
        case DudeInteractIndicator.ATTACKING_NOW:
            return Tilesets.instance.oneBit
                .getTileAt(new Point(27, 20))
                .filtered(ImageFilters.tint(Color.RED_4))
    }
}

const cache = {}

export const DudeInteractIndicator = {
    NONE: "",
    IMPORTANT_DIALOGUE: "!",
    ATTACKING_SOON: "o",
    ATTACKING_NOW: "O",

    getTile: (indicator: string): StaticSpriteSource => {
        const result = cache[indicator] || getIcon(indicator)
        cache[indicator] = result
        return result
    },
}
