import { Point } from "../Point"
import { View } from "../View"
import { RenderContext } from "./RenderContext"

export class Renderer {

    private static _instance: Renderer
    static get instance() {
        return this._instance
    }

    readonly canvas: HTMLCanvasElement
    readonly context: CanvasRenderingContext2D
    cameraOffsetX: number = 0
    cameraOffsetY: number = 0

    constructor(canvas: HTMLCanvasElement) {
        Renderer._instance = this
        this.canvas = canvas
        this.context = canvas.getContext('2d', { alpha: true })
        this.resizeCanvas()
    }

    private resizeCanvas() {
        // make sure stuff doesn't get stretched
        this.canvas.width = this.canvas.clientWidth
        this.canvas.height = this.canvas.clientHeight
    }

    render(views: View[]) {
        this.resizeCanvas()
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
                .flatMap(entity => entity?.components)
                .filter(component => !!component && component.enabled && component.isStarted)
                .flatMap(component => component.getRenderMethods())
                .filter(render => !!render)
                .sort((a, b) => a.depth - b.depth)  // TODO possibly improve this
                .forEach(renderMethod => renderMethod.render(viewRenderContext))
    }
}
