import { Point } from "../point"
import { RenderMethod } from "./RenderMethod"
import { RenderContext } from "./RenderContext"

export class ImageRender implements RenderMethod {
    source: CanvasImageSource
    sourcePosition: Point  // the top-left coordinate position on the source image
    dimensions: Point
    position: Point  // top-left coordinate position in the view
    rotation: number  // clockwise rotation in degrees
    scale: number
    mirrorX: boolean
    mirrorY: boolean

    constructor(
        source: CanvasImageSource, 
        sourcePosition: Point, 
        dimensions: Point, 
        position: Point, 
        rotation: number = 0, 
        scale: number = 1,
        mirrorX: boolean = false,
        mirrorY: boolean = false
    ) {
        this.source = source
        this.sourcePosition = sourcePosition, 
        this.dimensions = dimensions
        this.position = position
        this.rotation = rotation
        this.scale = scale
        this.mirrorX = mirrorX,
        this.mirrorY = mirrorY
    }

    render(context: RenderContext) {
        const pixelPerfect = false  // this can cause flickering between adjacent tiles, TODO make configurable

        context.drawImage(
            this.source, 
            this.sourcePosition, 
            this.dimensions, 
            this.position,
            this.dimensions.times(this.scale),
            this.rotation,
            pixelPerfect,
            this.mirrorX,
            this.mirrorY
        )
    }
}
