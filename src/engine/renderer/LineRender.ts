import { View } from "../view";
import { RenderMethod } from "./renderer";
import { Point } from "../point";
import { RenderContext } from "./RenderContext";

export class LineRender implements RenderMethod {
    start: Point
    end: Point
    width: number
    color: string

    constructor(start: Point, end: Point, width: number = 1, color: string = "#ff0000") {
        this.start = start
        this.end = end
        this.width = width
        this.color = color
    }

    render(context: RenderContext): void {
        context.lineWidth = this.width
        context.strokeStyle = this.color
        context.beginPath();
        context.moveTo(this.start);
        context.lineTo(this.end);
        context.stroke();
    }
}
