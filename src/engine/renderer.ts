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
            const position = e.position.plus(img.dimensions.div(2)).times(view.zoom)  // where to draw the img on the canvas (center)
            const pixelPos = new Point(this.pixelNum(position.x, view.zoom), this.pixelNum(position.y, view.zoom))
            const rotation = 0 * Math.PI/180

            this.context.translate(pixelPos.x, pixelPos.y)
            this.context.rotate(rotation)
            this.context.scale(img.mirrorX ? -1 : 1, img.mirrorY ? -1 : 1)

            this.context.drawImage(
                img.source, 
                img.position.x,
                img.position.y, 
                img.dimensions.x, 
                img.dimensions.y, 
                this.pixelNum(view.zoom * (-img.dimensions.x / 2 + (img.mirrorX ? -1 : 1) * view.offset.x), view.zoom), 
                this.pixelNum(view.zoom * (-img.dimensions.y / 2 + (img.mirrorY ? -1 : 1) * view.offset.y), view.zoom), 
                img.dimensions.x * view.zoom * img.scale, 
                img.dimensions.y * view.zoom * img.scale
            )

            this.context.scale(img.mirrorX ? -1 : 1, img.mirrorY ? -1 : 1)
            this.context.rotate(-rotation)
            this.context.translate(-pixelPos.x, -pixelPos.y)
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
    mirrorX: boolean
    mirrorY: boolean

    constructor(
        source: CanvasImageSource, 
        position: Point, 
        dimensions: Point, 
        rotation: number = 0, 
        scale: number = 1,
        mirrorX: boolean = false,
        mirrorY: boolean = false
    ) {
        this.source = source
        this.position = position
        this.dimensions = dimensions
        this.rotation = rotation
        this.scale = scale
        this.mirrorX = mirrorX,
        this.mirrorY = mirrorY
    }
}