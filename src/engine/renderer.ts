import { Entity } from "./entity"
import { Point } from "./point"
import { View } from "./view"

export class Renderer {
    readonly canvas: HTMLCanvasElement
    readonly context: CanvasRenderingContext2D
    cameraOffsetX: number = 0
    cameraOffsetY: number = 0

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas
        this.context = canvas.getContext('2d')
    }

    render(views: View[]) {
        // make sure stuff doesn't get stretched
        this.canvas.width = this.canvas.clientWidth
        this.canvas.height = this.canvas.clientHeight

        this.context.imageSmoothingEnabled = false
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
        
        views.forEach(v => this.renderView(v))
    }

    getDimensions(): Point {
        return new Point(this.canvas.width, this.canvas.height)
    }

    renderView(view: View) {
        view.entities.forEach(e => {
            const img = e.getRenderImage()
            const position = e.position.plus(img.dimensions.div(2)).times(view.zoom)  // center of object to draw
            const rotation = 0 * Math.PI/180

            this.context.translate(position.x, position.y)
            this.context.rotate(rotation)
            this.context.drawImage(
                img.source, 
                img.position.x,
                img.position.y, 
                img.dimensions.x, 
                img.dimensions.y, 
                this.pixelNum(view.zoom * (-img.dimensions.x / 2 + view.offset.x), view.zoom), 
                this.pixelNum(view.zoom * (-img.dimensions.y / 2 + view.offset.y), view.zoom), 
                img.dimensions.x * view.zoom * img.scale, 
                img.dimensions.y * view.zoom * img.scale
            )
            this.context.rotate(-rotation)
            this.context.translate(-position.x, -position.y)
        })
    }

    private pixelNum(val: number, zoom: number): number {
        return val - (val % zoom)
    }
}

export class RenderImage {
    source: CanvasImageSource
    position: Point  // the top-left coordinate position on the source image
    dimensions: Point
    rotation: number  // clockwise rotation in degrees
    scale: number

    constructor(
        source: CanvasImageSource, 
        position: Point, 
        dimensions: Point, 
        rotation: number = 0, 
        scale: number = 1
    ) {
        this.source = source
        this.position = position
        this.dimensions = dimensions
        this.rotation = rotation
        this.scale = scale
    }
}