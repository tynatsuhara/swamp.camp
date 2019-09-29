import { Entity } from "./entity"
import { Point } from "./point"
import { View } from "./view";

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
            this.context.drawImage(
                img.source, 
                img.position.x, 
                img.position.y, 
                img.dimensions.x, 
                img.dimensions.y, 
                this.pixelNum(e.position.x * view.zoom + view.offset.x, view.zoom), 
                this.pixelNum(e.position.y * view.zoom + view.offset.y, view.zoom), 
                img.dimensions.x * view.zoom, 
                img.dimensions.y * view.zoom
            )
        })
    }

    private pixelNum(val: number, zoom: number): number {
        return val - (val % zoom)
    }
}

export class RenderImage {
    source: CanvasImageSource
    position: Point
    dimensions: Point
}