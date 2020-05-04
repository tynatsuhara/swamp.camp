import { View } from "../View"
import { RenderMethod } from "./RenderMethod"
import { Point } from "../point"
import { RenderContext } from "./RenderContext"
import { Component } from "../component"

export class TextRender extends RenderMethod {
    text: string
    position: Point  // top-left
    size: number
    font: string
    color: string

    constructor(
        text: string, 
        position: Point, 
        fontSizePx: number = 20,
        font: string = "Comic Sans MS Regular", 
        color: string = "red",
        depth: number = 0
    ) {
        super(depth)
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
