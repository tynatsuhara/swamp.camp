import { RenderContext } from "./RenderContext"

export interface RenderMethod {
    render(context: RenderContext): void
}
