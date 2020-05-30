import { StaticTileSource } from "../../engine/tiles/StaticTileSource"
import { assets } from "../../engine/Assets"
import { Point } from "../../engine/point"
import { TileSetAnimation } from "../../engine/tiles/TileSetAnimation"

export class SplitFileTileLoader {

    private readonly dirPath: string

    constructor(dirPath: string) {
        this.dirPath = dirPath
    }

    getTileSource(key: string): StaticTileSource {
        const image = assets.getImageByFileName(`${this.dirPath}/${key}.png`)
        return new StaticTileSource(
            image, 
            new Point(0, 0),
            new Point(image.width, image.height), 
        )
    }
    
    getTileSetAnimation(key: string, frames: number, speed: number): TileSetAnimation {
        const framesArr = []
        for (let i = 1; i <= frames; i++) {
            framesArr.push(this.getTileSource(`${key}_${i}`))
        }
        return new TileSetAnimation(framesArr.map(f => [f, speed]))
    }
}