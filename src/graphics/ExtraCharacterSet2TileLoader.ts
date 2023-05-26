import { Point } from "brigsby/dist"
import { SpriteAnimation, StaticSpriteSource } from "brigsby/dist/sprites"
import { getImage } from "./Tilesets"

const ROW_WIDTH = 160
const ROW_START = 32
const TILE_HEIGHT = 32
const TILE_WIDTH = 16

// maps to [column, row]
const CHARACTERS = new Map([
    ["doctor", [0, 2]],
    ["mr-bones", [0, 6]],
    ["widdershins", [1, 1]],
    ["prisoner1", [1, 2]],
    ["prisoner2", [1, 3]],
    ["prisoner3", [1, 4]],
    ["prisoner4", [1, 5]],
    ["santa", [2, 4]],
])

export class ExtraCharacterSet2TileLoader {
    getIdleAnimation(key: string, speed: number): SpriteAnimation {
        return this.getAnimation(key, speed, 0)
    }

    getWalkAnimation(key: string, speed: number): SpriteAnimation {
        return this.getAnimation(key, speed, 4)
    }

    getAnimation(key: string, speed: number, offset: number): SpriteAnimation {
        const result = CHARACTERS.get(key)
        if (!result) {
            return null
        }
        const col = result[0]
        const row = result[1]
        const pos = new Point(col * ROW_WIDTH, ROW_START + TILE_HEIGHT * row)
        return new SpriteAnimation(
            Array.from({ length: 4 }, (v, k) => k)
                .map((index) => this.getTileAt(pos.plusX(TILE_WIDTH * (index + offset))))
                .map((tileSource) => [tileSource, speed])
        )
    }

    private getTileAt(pos: Point) {
        return new StaticSpriteSource(this.image(), pos, new Point(TILE_WIDTH, TILE_HEIGHT))
    }

    private image() {
        return getImage("images/extra_characters.png")
    }
}
