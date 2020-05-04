import { View } from "../View"
import { RenderMethod } from "./RenderMethod"
import { Point } from "../point"
import { RenderContext } from "./RenderContext"
import { Component } from "../component"

export class TextRender extends RenderMethod {
    readonly text: string
    readonly position: Point  // top-left
    readonly size: number
    readonly font: string
    readonly color: string

    constructor(
        text: string, 
        position: Point, 
        fontSizePx: number = 20,
        font: string = "Comic Sans MS Regular", 
        color: string = "red",
    ) {
        super(Number.MAX_SAFE_INTEGER)
        this.text = text
        this.position = position
        this.size = fontSizePx
        this.font = font
        this.color = color
    }

    render(context: RenderContext): void {
        context.fillText(this.size, this.font, this.color, this.text, this.position)
    }
}
