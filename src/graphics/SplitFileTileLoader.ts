import { Point } from "brigsby/dist"
import { SpriteAnimation, StaticSpriteSource } from "brigsby/dist/sprites"
import { getImage } from "./Tilesets"

export class SplitFileTileLoader {
    private readonly dirPath: string

    constructor(dirPath: string) {
        this.dirPath = dirPath
    }

    getTileSource(key: string): StaticSpriteSource {
        const image = getImage(`${this.dirPath}/${key}.png`)
        if (!image) {
            return null
        }
        return new StaticSpriteSource(image, new Point(0, 0), new Point(image.width, image.height))
    }

    getTileSetAnimation(key: string, frames: number, speed: number): SpriteAnimation {
        const framesArr = []
        for (let i = 1; i <= frames; i++) {
            const image = this.getTileSource(`${key}_${i}`)
            if (!image) {
                return null
            }
            framesArr.push(image)
        }
        return new SpriteAnimation(framesArr.map((f) => [f, speed]))
    }
}
