import { Point } from "../../engine/point"
import { TileSource } from "../../engine/tiles/TileSource"
import { assets } from "../../engine/Assets"
import { TileSetAnimation } from "../../engine/tiles/TileSetAnimation"

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

    getTileSource(key: string): TileSource {
        const result = this.map.get(key)
        if (!result) {
            return null
        }
        return this.getTileAt(result)
    }

    getTileAt(pos: Point) {
        return new TileSource(
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