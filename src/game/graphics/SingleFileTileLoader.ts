import { Point } from "../../engine/point"
import { StaticTileSource } from "../../engine/tiles/StaticTileSource"
import { assets } from "../../engine/Assets"
import { TileSetAnimation } from "../../engine/tiles/TileSetAnimation"
import { TileSource } from "../../engine/tiles/TileSource"

export class SingleFileTileLoader {

    private readonly filename: string
    private readonly map: Map<string, Point>
    private readonly tileSize: number
    private readonly padding: number

    constructor(filename: string, map: Map<string, Point> = new Map(), tileSize: number = 16, padding = 1) {
        this.filename = filename
        this.map = map
        this.tileSize = tileSize
        this.padding = padding
    }

    getNineSlice(key: string): TileSource[] {
        const pt = this.map.get(key)
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

    getTileSource(key: string): StaticTileSource {
        const result = this.map.get(key)
        if (!result) {
            throw new Error(`${key} is not a valid tile`)
        }
        return this.getTileAt(result)
    }

    getTileAt(pos: Point) {
        return new StaticTileSource(
            this.image(), 
            pos.times(this.tileSize + this.padding), 
            new Point(this.tileSize, this.tileSize)
        )
    }

    getTileSetAnimation(key: string, frames: number, speed: number): TileSetAnimation {
        const result = this.map.get(key)
        if (!result) {
            return null
        }
        return new TileSetAnimation(
            Array.from({length: frames}, (k, v) => v)
                    .map((index) => this.getTileAt(result.plus(new Point(index, 0))))
                    .map(tileSource => [tileSource, speed])
        )
    }

    private image() {
        return assets.getImageByFileName(this.filename)
    }
}