import { Point } from "../point"
import { ImageRender } from "../renderer/ImageRender"
import { TileTransform } from "./TileTransform"
import { TileComponent } from "./TileComponent"
import { Entity } from "../Entity"

export class TileSource {
    private image: CanvasImageSource
    private position: Point
    readonly dimensions: Point

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
            transform.dimensions ?? this.dimensions,
            transform.depth,
            transform.rotation, 
            transform.mirrorX, 
            transform.mirrorY
        )
    }

    // Shorthand for turning a TileSource into an Entity at a given point (will be multiplied by the dimensions)
    at(pt: Point): Entity {
        return new Entity([new TileComponent(
            this, 
            new TileTransform(new Point(pt.x * this.dimensions.x, pt.y * this.dimensions.y)))
        ])
    }
}
