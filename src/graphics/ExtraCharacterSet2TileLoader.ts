import { assets } from "brigsby/dist/Assets"
import { Point } from "brigsby/dist/Point"
import { StaticSpriteSource } from "brigsby/dist/sprites/StaticSpriteSource"
import { SpriteAnimation } from "brigsby/dist/sprites/SpriteAnimation"

const ROW_WIDTH = 160
const ROW_START = 32
const TILE_HEIGHT = 32
const TILE_WIDTH = 16

// maps to [column, row]
const CHARACTERS = new Map([
    ["prisoner1", [1, 1]],
    ["prisoner2", [1, 3]],
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
            Array.from({length: 4}, (v, k) => k)
                    .map((index) => this.getTileAt(pos.plusX(TILE_WIDTH * (index + offset))))
                    .map(tileSource => [tileSource, speed])
        )
    }

    private getTileAt(pos: Point) {
        return new StaticSpriteSource(
            this.image(), 
            pos,
            new Point(TILE_WIDTH, TILE_HEIGHT)
        )
    }

    private image() {
        return assets.getImageByFileName("images/extra_characters.png")
    }
}