import { Point } from "brigsby/dist/Point"
import { StaticSpriteSource } from "brigsby/dist/sprites/StaticSpriteSource"
import { getImage, TILE_SIZE } from "./Tilesets"

export class LargeSpriteTileset {
    getTileSource(key: string): StaticSpriteSource {
        if (key === "mine-small") {
            return this.get(Point.ZERO, new Point(3, 4))
        } else if (key === "church") {
            return this.get(new Point(4, 0), new Point(3, 5))
        }
        throw new Error(`${key} is not a valid tile`)
    }

    private get(position: Point, dimensions: Point) {
        return new StaticSpriteSource(
            this.image(),
            position.times(TILE_SIZE),
            dimensions.times(TILE_SIZE)
        )
    }

    private image() {
        return getImage("images/large-sprites.png")
    }
}
