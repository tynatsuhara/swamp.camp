import { RenderMethod } from "./RenderMethod"
import { RenderContext } from "./RenderContext"
import { Point } from "../point"

export class TintRender extends RenderMethod {

    private readonly color: string

    constructor(
        color: string,
        depth: number
    ) {
        super(depth)
        this.color = color
    }

    render(context: RenderContext): void {
        context.fillStyle = this.color
        context.fillRect(0, 0, context.width, context.height)
    }
}