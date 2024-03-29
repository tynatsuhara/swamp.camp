import { Point } from "brigsby/dist"
import { SpriteAnimation, SpriteSource, StaticSpriteSource } from "brigsby/dist/sprites"
import { isGamePaused } from "../core/PauseState"
import { getImage } from "./Tilesets"

export class SingleFileTileLoader<K extends string> {
    private readonly filename: string
    private readonly map: Record<K, Point>
    private readonly tileSize: Point
    private readonly padding: number

    constructor(
        filename: string,
        map: Record<K, Point>,
        tileSize: Point = new Point(16, 16),
        padding = 1
    ) {
        this.filename = filename
        this.map = map
        this.tileSize = tileSize
        this.padding = padding
    }

    getNineSlice(key: string): SpriteSource[] {
        const pt = this.map[key]
        if (!pt) {
            throw new Error(`${key} is not a valid tile`)
        }
        const result = []
        for (let y = 0; y < 3; y++) {
            for (let x = 0; x < 3; x++) {
                result.push(this.getTileAt(pt.plus(new Point(x, y))))
            }
        }
        return result
    }

    getTileSource(key: string): StaticSpriteSource {
        const result = this.map[key]
        if (!result) {
            throw new Error(`${key} is not a valid tile`)
        }
        return this.getTileAt(result)
    }

    getTileAt(pos: Point) {
        return new StaticSpriteSource(
            this.image(),
            new Point(
                pos.x * (this.tileSize.x + this.padding),
                pos.y * (this.tileSize.y + this.padding)
            ),
            this.tileSize
        )
    }

    getTileSetAnimation(key: string, frames: number, speed: number): SpriteAnimation {
        const result = this.map[key]
        if (!result) {
            return null
        }
        return new SpriteAnimation(
            Array.from({ length: frames }, (v, k) => k)
                .map((index) => this.getTileAt(result.plus(new Point(index, 0))))
                .map((tileSource) => [tileSource, speed]),
            () => {},
            isGamePaused
        )
    }

    private image() {
        return getImage(this.filename)
    }
}
