import { RenderContext } from "./RenderContext"

export abstract class RenderMethod {
    depth: number
    alternateCanvas: string

    constructor(depth: number, alternateCanvas: string = null) {
        this.depth = depth
        this.alternateCanvas = alternateCanvas
    }

    abstract render(context: RenderContext): void
}
