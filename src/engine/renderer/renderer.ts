import { Point } from "../point"
import { View } from "../View"
import { RenderContext } from "./RenderContext"

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
        const viewRenderContext = new RenderContext(this.canvas, this.context, view)
        view.entities
                .filter(entity => !!entity)
                .flatMap(entity => entity.components)
                .filter(component => !!component)
                .flatMap(component => component.getRenderMethods())
                .sort((a, b) => a.depth - b.depth)  // TODO possibly improve this
                .forEach(renderMethod => renderMethod.render(viewRenderContext))
    }
}
