import { TileSource } from "../../engine/tiles/TileSource"
import { assets } from "../../engine/Assets"
import { Point } from "../../engine/point"
import { TileSetAnimation } from "../../engine/tiles/TileSetAnimation"

export class SplitFileTileLoader {

    private readonly dirPath: string

    constructor(dirPath: string) {
        this.dirPath = dirPath
    }

    getTileSource(key: string): TileSource {
        const image = assets.getImageByFileName(`${this.dirPath}/${key}.png`)
        if (!!image) {
            return null
        }
        return new TileSource(
            image, 
            new Point(image.width, image.height), 
            new Point(0, 0)
        )
    }
    
    getTileSetAnimation(key: string, speed: number): TileSetAnimation {
        throw new Error("Method not implemented.")
    }
}