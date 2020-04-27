import { View } from "../View"
import { RenderMethod } from "./RenderMethod"
import { Point } from "../point"
import { RenderContext } from "./RenderContext"
import { Component } from "../component"

export class TextRender extends RenderMethod {
    readonly text: string
    readonly position: Point
    readonly font: string
    readonly color: string

    constructor(
        text: string, 
        position: Point, 
        font: string = "20px Comic Sans MS Regular", 
        color: string = "red",
    ) {
        super(Number.MAX_SAFE_INTEGER)
        this.text = text
        this.position = position
        this.font = font
        this.color = color
    }

    render(context: RenderContext): void {
        context.font = this.font
        context.fillStyle = this.color
        context.fillText(this.text, this.position)
    }
}
