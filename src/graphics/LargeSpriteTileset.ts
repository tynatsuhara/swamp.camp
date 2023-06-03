import { Point, pt } from "brigsby/dist"
import { StaticSpriteSource } from "brigsby/dist/sprites"
import { TILE_SIZE, getImage } from "./Tilesets"

export class LargeSpriteTileset {
    getTileSource(key: string): StaticSpriteSource {
        switch (key) {
            case "church":
                return this.get({ position: pt(16, 0), dimensions: pt(3, 5) })
            case "dr-interior":
                return this.get({ position: pt(1, 10), dimensions: pt(5, 6) })
            case "dr-counter":
                return this.get({ position: pt(0, 16), dimensions: pt(3, 1) })
            case "skeleton":
                return this.get({ position: pt(0, 11), dimensions: pt(1, 2) })
            case "apothecary":
                return this.get({ position: pt(6, 10), dimensions: pt(3, 5) })
            case "cabin-small":
                return this.get({ position: pt(0, 6), dimensions: pt(3, 3) })
            case "town-hall":
                return this.get({ position: pt(5, 17), dimensions: pt(5, 4) })
            case "town-hall-interior":
                return this.get({ position: pt(0, 17), dimensions: pt(5, 6) })
            case "tent-interior":
                return this.get({ position: pt(0, 23), dimensions: pt(5, 7) })
            default:
                throw new Error(`${key} is not a valid tile`)
        }
    }

    get({ position, dimensions }: { position: Point; dimensions: Point }): StaticSpriteSource {
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
