import { Point, pt } from "brigsby/dist"
import { StaticSpriteSource } from "brigsby/dist/sprites"
import { getImage, TILE_SIZE } from "./Tilesets"

export class LargeSpriteTileset {
    getTileSource(key: string): StaticSpriteSource {
        switch (key) {
            case "mine-small":
                return this.get(Point.ZERO, pt(5, 5))
            case "church":
                return this.get(pt(16, 0), pt(3, 5))
            case "dr-interior":
                return this.get(pt(1, 10), pt(5, 6))
            case "dr-counter":
                return this.get(pt(0, 16), pt(3, 1))
            case "skeleton":
                return this.get(pt(0, 11), pt(1, 2))
            case "apothecary":
                return this.get(pt(6, 10), pt(3, 5))
            case "cabin-small":
                return this.get(pt(0, 6), pt(3, 3))
            case "tent-interior":
                return this.get(pt(0, 22), pt(5, 7))
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
