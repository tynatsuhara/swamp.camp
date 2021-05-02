import { Tilesets } from "../graphics/Tilesets"
import { Point } from "../../engine/Point"
import { StaticTileSource } from "../../engine/tiles/StaticTileSource"

export const DudeInteractIndicator = {
    NONE: "",
    IMPORTANT_DIALOGUE: "!",
    ATTACKING: "X",

    getTile: (indicator: string): StaticTileSource => {
        switch (indicator) {
            case DudeInteractIndicator.NONE: 
                return null
            case DudeInteractIndicator.IMPORTANT_DIALOGUE: 
                return Tilesets.instance.oneBit.getTileAt(new Point(19, 25))
            case DudeInteractIndicator.ATTACKING: 
                return Tilesets.instance.oneBit.getTileAt(new Point(27, 20))
        }
    },
}
