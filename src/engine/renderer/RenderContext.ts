import { View } from "../view"
import { Point } from "../point"

export class RenderContext {

    private readonly context: CanvasRenderingContext2D
    private readonly view: View

    constructor(context: CanvasRenderingContext2D, view: View) {
        this.context = context
        this.view = view
    }

    set lineWidth(value: number) { this.context.lineWidth = value }
    set strokeStyle(value: string) { this.context.strokeStyle = value }

    clearRect(x: number, y: number, w: number, h: number): void {
        this.context.clearRect(x, y, w, h)
    }

    translate(point: Point, pixelPerfect: boolean = false): void {
        let pos = point.times(this.view.zoom)
        if (pixelPerfect) {
            pos = this.pixelize(pos)
        }
        this.context.translate(pos.x, pos.y)
    }

    drawImage(
        source: CanvasImageSource, 
        sourcePosition: Point, 
        sourceDimensions: Point, 
        destDimensions: Point, 
        pixelPerfect: boolean,
        mirrorX: boolean,
        mirrorY: boolean
    ): void {
        let scaledDestPosition = new Point(
            -sourceDimensions.x / 2 + (mirrorX ? -1 : 1) * this.view.offset.x,
            -sourceDimensions.y / 2 + (mirrorY ? -1 : 1) * this.view.offset.y
        ).times(this.view.zoom)

        if (pixelPerfect) {
            scaledDestPosition = this.pixelize(scaledDestPosition)
        }

        let scaledDestDimensions = destDimensions.times(this.view.zoom)

        this.context.drawImage(
            source, 
            sourcePosition.x, sourcePosition.y, 
            sourceDimensions.x, sourceDimensions.y, 
            scaledDestPosition.x, scaledDestPosition.y, 
            scaledDestDimensions.x, scaledDestDimensions.y
        )
    }

    rotate(angle: number): void {
        this.context.rotate(angle)
    }

    scale(x: number, y: number): void {
        this.context.scale(x, y)
    }

    beginPath(): void {
        this.context.beginPath()
    }

    moveTo(point: Point): void {
        point = point.plus(this.view.offset).times(this.view.zoom)
        this.context.moveTo(point.x, point.y)
    }

    lineTo(point: Point): void {
        point = point.plus(this.view.offset).times(this.view.zoom)
        this.context.lineTo(point.x, point.y)
    }

    stroke(): void {
        this.context.stroke()
    }

    pixelize(point: Point): Point {
        return new Point(point.x - (point.x % this.view.zoom), point.y - (point.y % this.view.zoom))
    }
}