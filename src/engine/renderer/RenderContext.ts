import { View } from "../View"
import { Point } from "../point"

export class RenderContext {
    private readonly canvas: HTMLCanvasElement
    private readonly context: CanvasRenderingContext2D
    private readonly view: View

    constructor(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D, view: View) {
        this.canvas = canvas
        this.context = context
        this.view = view
    }

    set lineWidth(value: number) { this.context.lineWidth = value }
    set strokeStyle(value: string) { this.context.strokeStyle = value }

    set font(value: string) { this.context.font = value }
    set fillStyle(value: string) { this.context.fillStyle = value }

    fillText(text: string, point: Point) {
        point = point.plus(this.view.offset).times(this.view.zoom)
        this.context.fillText(text, point.x, point.y)
    }

    /**
     * @param source 
     * @param sourcePosition 
     * @param sourceDimensions 
     * @param destPosition the top left corner where the image will be drawn
     * @param destDimensions 
     * @param rotation (will be mirrored by mirrorX or mirrorY)
     * @param pixelPerfect 
     * @param mirrorX 
     * @param mirrorY 
     */
    drawImage(
        source: CanvasImageSource, 
        sourcePosition: Point, 
        sourceDimensions: Point, 
        destPosition: Point,
        destDimensions: Point, 
        rotation: number,
        pixelPerfect: boolean,
        mirrorX: boolean,
        mirrorY: boolean
    ): void {
        const mirroredOffset = new Point(mirrorX ? destDimensions.x : 0, mirrorY ? destDimensions.y : 0)
        let scaledDestPosition = destPosition.plus(this.view.offset).plus(mirroredOffset).times(this.view.zoom)
        if (pixelPerfect) {
            scaledDestPosition = this.pixelize(scaledDestPosition)
        }
        const scaledDestDimensions = destDimensions.times(this.view.zoom)

        if (scaledDestPosition.x > this.canvas.width 
            || scaledDestPosition.x + scaledDestDimensions.x < 0
            || scaledDestPosition.y > this.canvas.height
            || scaledDestPosition.y + scaledDestDimensions.y < 0) {
            return
        }

        this.context.save()
        this.context.translate(scaledDestPosition.x, scaledDestPosition.y)
        this.context.scale(mirrorX ? -1 : 1, mirrorY ? -1 : 1)

        const rotationTranslate = destDimensions.div(2).times(this.view.zoom)
        this.context.translate(rotationTranslate.x, rotationTranslate.y)
        this.context.rotate(rotation * Math.PI/180)
        this.context.translate(-rotationTranslate.x, -rotationTranslate.y)

        this.context.drawImage(
            source, 
            sourcePosition.x, sourcePosition.y, 
            sourceDimensions.x, sourceDimensions.y, 
            0, 0,
            scaledDestDimensions.x, scaledDestDimensions.y
        )

        this.context.restore()
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