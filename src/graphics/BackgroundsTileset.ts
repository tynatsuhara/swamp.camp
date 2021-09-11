import { assets } from "brigsby/dist/Assets"
import { Point } from "brigsby/dist/Point"
import { StaticSpriteSource } from "brigsby/dist/sprites/StaticSpriteSource"
import { TILE_SIZE } from "./Tilesets"

export class BackgroundsTileset {
    getTileSource(key: string): StaticSpriteSource {
        if (key === "mine-small") {
            return new StaticSpriteSource(
                this.image(), 
                Point.ZERO,
                new Point(3, 4).times(TILE_SIZE)
            )
        }
        throw new Error(`${key} is not a valid tile`)
    }

    private image() {
        return assets.getImageByFileName("images/backgrounds.png")
    }
}