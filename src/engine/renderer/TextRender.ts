import { View } from "../View"
import { RenderMethod } from "./RenderMethod"
import { Point } from "../point"
import { RenderContext } from "./RenderContext"
import { Component } from "../component"

export class TextRenderComponent extends Component implements RenderMethod {
    text: string
    position: Point
    font: string
    color: string

    constructor(text: string, position: Point, font: string = "20px Comic Sans MS Regular", color: string = "red") {
        super()
        this.text = text
        this.position = position
        this.font = font
        this.color = color
    }

    getRenderMethods() {
        return [this]
    }

    render(context: RenderContext): void {
        context.font = this.font
        context.fillStyle = this.color
        context.fillText(this.text, this.position)
    }
}
