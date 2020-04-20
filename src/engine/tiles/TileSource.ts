import { Point } from "../point"
import { ImageRender } from "../renderer/ImageRender"
import { TileTransform } from "./TileTransform"
import { TileSet } from "./TileSet"

export class TileSource {
    private tileSet: TileSet
    private tileSetIndex: Point
    
    /**
     * Constructs a static (non-animated) tile source
     */
    constructor(tileSet: TileSet, tileSetIndex: Point) {
        this.tileSet = tileSet
        this.tileSetIndex = tileSetIndex
    }

    toImageRender(transform: TileTransform) {
        return new ImageRender(
            this.tileSet.image, 
            new Point(this.tileSetIndex.x, this.tileSetIndex.y).times(this.tileSet.tileSize + this.tileSet.padding), 
            new Point(this.tileSet.tileSize, this.tileSet.tileSize), 
            transform.position, 
            transform.rotation, 
            transform.scale, 
            transform.mirrorX, 
            transform.mirrorY
        )
    }
}
