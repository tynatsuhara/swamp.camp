import { Point } from "../point"
import { ImageRender } from "../renderer/ImageRender"
import { TileTransform } from "./TileTransform"

export class TileSource {
    private image: CanvasImageSource
    private position: Point
    private dimensions: Point

    /**
     * Constructs a static (non-animated) tile source
     */
    constructor(
        image: CanvasImageSource, 
        position: Point,
        dimensions: Point
    ) {
        this.image = image
        this.position = position
        this.dimensions = dimensions
    }

    toImageRender(transform: TileTransform) {
        return new ImageRender(
            this.image, 
            this.position,
            this.dimensions, 
            transform.position, 
            transform.depth,
            transform.rotation, 
            transform.scale, 
            transform.mirrorX, 
            transform.mirrorY
        )
    }
}
