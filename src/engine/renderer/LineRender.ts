import { View } from "../view";
import { RenderMethod } from "./RenderMethod";
import { Point } from "../point";
import { RenderContext } from "./RenderContext";

export class LineRender implements RenderMethod {
    start: Point
    end: Point
    color: string
    width: number

    constructor(start: Point, end: Point, color: string = "#ff0000", width: number = 1) {
        this.start = start
        this.end = end
        this.color = color
        this.width = width
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
