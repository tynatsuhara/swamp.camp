import { StaticTileSource } from "../../engine/tiles/StaticTileSource"
import { assets } from "../../engine/Assets"
import { Point } from "../../engine/Point"
import { TileSetAnimation } from "../../engine/tiles/TileSetAnimation"

export class SplitFileTileLoader {

    private readonly dirPath: string

    constructor(dirPath: string) {
        this.dirPath = dirPath
    }

    getTileSource(key: string): StaticTileSource {
        const image = assets.getImageByFileName(`${this.dirPath}/${key}.png`)
        if (!image) {
            return null
        }
        return new StaticTileSource(
            image, 
            new Point(0, 0),
            new Point(image.width, image.height), 
        )
    }
    
    getTileSetAnimation(key: string, frames: number, speed: number): TileSetAnimation {
        const framesArr = []
        for (let i = 1; i <= frames; i++) {
            const image = this.getTileSource(`${key}_${i}`)
            if (!image) {
                return null
            }
            framesArr.push(image)
        }
        return new TileSetAnimation(framesArr.map(f => [f, speed]))
    }
}