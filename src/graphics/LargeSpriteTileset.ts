import { Point } from "brigsby/dist/Point"
import { StaticSpriteSource } from "brigsby/dist/sprites/StaticSpriteSource"
import { getImage, TILE_SIZE } from "./Tilesets"

export class LargeSpriteTileset {
    getTileSource(key: string): StaticSpriteSource {
        switch (key) {
            case "mine-small":
                return this.get(Point.ZERO, new Point(3, 4))
            case "church":
                return this.get(new Point(4, 0), new Point(3, 5))
            case "dr-interior":
                return this.get(new Point(1, 10), new Point(4, 5))
            case "dr-counter":
                return this.get(new Point(0, 15), new Point(3, 1))
            case "skeleton":
                return this.get(new Point(0, 11), new Point(1, 2))
            case "apothecary":
                return this.get(new Point(6, 10), new Point(3, 5))
            default:
                throw new Error(`${key} is not a valid tile`)
        }
    }

    get(position: Point, dimensions: Point): StaticSpriteSource {
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