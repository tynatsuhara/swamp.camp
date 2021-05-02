import { Point } from "../Point"
import { ImageRender } from "../renderer/ImageRender"
import { TileTransform } from "./TileTransform"
import { TileComponent } from "./TileComponent"
import { TileSource } from "./TileSource"

export class StaticTileSource implements TileSource {
    readonly image: CanvasImageSource
    readonly position: Point
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

    toComponent(transform: TileTransform = new TileTransform()): TileComponent {
        return new TileComponent(this, transform)
    }

    filtered(filter: (img: ImageData) => ImageData): StaticTileSource {
        const canvas = document.createElement("canvas")
        canvas.width = this.dimensions.x
        canvas.height = this.dimensions.y
        const context = canvas.getContext("2d")
        context.imageSmoothingEnabled = false
        
        context.drawImage(this.image, this.position.x, this.position.y, this.dimensions.x, this.dimensions.y, 0, 0, this.dimensions.x, this.dimensions.y)
        const imageData = context.getImageData(0, 0, this.dimensions.x, this.dimensions.y)
        const filtered = filter(imageData)
        context.putImageData(filtered, 0, 0)

        return new StaticTileSource(canvas, Point.ZERO, new Point(filtered.width, filtered.height))
    }
}
