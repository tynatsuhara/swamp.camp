import { Tilesets } from "../graphics/Tilesets"
import { Point } from "../../engine/point"
import { StaticTileSource } from "../../engine/tiles/StaticTileSource"

export const DudeInteractIndicator = {
    NONE: "",
    IMPORTANT_DIALOGUE: "!",

    getTile: (indicator: string): StaticTileSource => {
        switch (indicator) {
            case DudeInteractIndicator.NONE: 
                return null
            case DudeInteractIndicator.IMPORTANT_DIALOGUE: 
                return Tilesets.instance.oneBit.getTileAt(new Point(19, 25))
        }
    },
}
