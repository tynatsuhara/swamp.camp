import { Point } from "brigsby/dist/Point"
import { StaticSpriteSource } from "brigsby/dist/sprites/StaticSpriteSource"
import { getImage, TILE_SIZE } from "./Tilesets"

export class LargeSpriteTileset {
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
        return getImage("images/large-sprites.png")
    }
}
