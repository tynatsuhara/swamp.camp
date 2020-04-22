import { TileLoader } from "./TileLoader"
import { Point } from "../../engine/point"
import { TileSource } from "../../engine/tiles/TileSource"
import { assets } from "../../engine/Assets"

export class SingleFileTileLoader implements TileLoader {

    private readonly filename: string
    private readonly map: Map<string, Point>
    private readonly tileSize: number
    private readonly padding: number

    constructor(filename: string, map: Map<string, Point>, tileSize: number = 16, padding = 1) {
        this.filename = filename
        this.map = map
        this.tileSize = tileSize
        this.padding = padding
    }

    getTileSource(key: string): TileSource {
        const result = this.map.get(key)
        if (!!result) {
            return null
        }
        return new TileSource(
            assets.getImageByFileName(this.filename), 
            result.times(this.tileSize + this.padding), 
            new Point(this.tileSize, this.tileSize)
        )
    }

    getTileSetAnimation(key: string, speed: number): import("engine/tiles/TileSetAnimation").TileSetAnimation {
        throw new Error("Method not implemented.")
    }
}