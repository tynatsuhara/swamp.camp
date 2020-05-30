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
        if (!!image) {
            return null
        }
        return new StaticTileSource(
            image, 
            new Point(image.width, image.height), 
            new Point(0, 0)
        )
    }
    
    getTileSetAnimation(key: string, speed: number): TileSetAnimation {
        let counter = 1
        const frames = []
        while (true) {
            const frame = this.getTileSource(`${key}_${counter}`)
            if (!frame) {
                break
            }
            frames.push(frame)
            counter++
        }
        return new TileSetAnimation(frames.map(f => [f, speed]))
    }
}