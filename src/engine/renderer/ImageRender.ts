import { Point } from "../point";
import { RenderMethod } from "./renderer";
import { RenderContext } from "./RenderContext";

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
        const position = this.position.plus(this.dimensions.div(2)) // where to draw the this on the canvas (centered)
        const rotation = 0 * Math.PI/180
        const pixelPerfect = true

        context.translate(position, pixelPerfect)
        context.rotate(rotation)
        context.scale(this.mirrorX ? -1 : 1, this.mirrorY ? -1 : 1)
        context.drawImage(
            this.source, 
            this.sourcePosition, 
            this.dimensions, 
            this.dimensions.times(this.scale),
            pixelPerfect,
            this.mirrorX,
            this.mirrorY
        )

        context.scale(this.mirrorX ? -1 : 1, this.mirrorY ? -1 : 1)
        context.rotate(-rotation)
        context.translate(position.times(-1), pixelPerfect)
    }
}
