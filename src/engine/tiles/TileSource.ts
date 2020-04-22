import { Point } from "../point"
import { ImageRender } from "../renderer/ImageRender"
import { TileTransform } from "./TileTransform"
import { TileSet } from "./TileSet"

export class TileSource {
    private tileSet: TileSet
    private position: Point
    private dimensions: Point

    /**
     * Constructs a static (non-animated) tile source
     */
    constructor(
        tileSet: TileSet, 
        position: Point,
        dimensions: Point
    ) {
        this.tileSet = tileSet
        this.position = position
        this.dimensions = dimensions
    }

    toImageRender(transform: TileTransform) {
        return new ImageRender(
            this.tileSet.image, 
            this.position, //new Point(this.tileSetIndex.x, this.tileSetIndex.y).times(this.tileSet.tileSize + this.tileSet.padding), 
            this.dimensions, 
            transform.position, 
            transform.rotation, 
            transform.scale, 
            transform.mirrorX, 
            transform.mirrorY
        )
    }
}
