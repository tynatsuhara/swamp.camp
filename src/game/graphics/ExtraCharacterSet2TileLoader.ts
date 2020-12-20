import { assets } from "../../engine/Assets"
import { Point } from "../../engine/point"
import { StaticTileSource } from "../../engine/tiles/StaticTileSource"
import { TileSetAnimation } from "../../engine/tiles/TileSetAnimation"

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

    getIdleAnimation(key: string, speed: number): TileSetAnimation {
        return this.getAnimation(key, speed, 0)
    }

    getWalkAnimation(key: string, speed: number): TileSetAnimation {
        return this.getAnimation(key, speed, 4)
    }

    getAnimation(key: string, speed: number, offset: number): TileSetAnimation {
        const result = CHARACTERS.get(key)
        if (!result) {
            return null
        }
        const col = result[0]
        const row = result[1]
        const pos = new Point(col * ROW_WIDTH, ROW_START + TILE_HEIGHT * row)
        return new TileSetAnimation(
            Array.from({length: 4}, (k, v) => v)
                    .map((index) => this.getTileAt(pos.plusX(TILE_WIDTH * (index + offset))))
                    .map(tileSource => [tileSource, speed])
        )
    }

    private getTileAt(pos: Point) {
        return new StaticTileSource(
            this.image(), 
            pos,
            new Point(TILE_WIDTH, TILE_HEIGHT)
        )
    }

    private image() {
        return assets.getImageByFileName("images/extra_characters.png")
    }
}