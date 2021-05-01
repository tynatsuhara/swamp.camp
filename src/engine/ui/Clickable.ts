import { Component } from "../Component";
import { UpdateData } from "../Engine";
import { Point } from "../Point";
import { rectContains } from "../util/Utils";

export class Clickable extends Component {
    private readonly position: Point
    private readonly dimensions: Point
    private readonly onClick: () => void

    constructor(
        position: Point, 
        dimensions: Point, 
        onClick: () => void
    ) {
        super()
        this.position = position
        this.dimensions = dimensions
        this.onClick = onClick
    }

    update(updateData: UpdateData) {
        if (updateData.input.isMouseDown && rectContains(this.position, this.dimensions, updateData.input.mousePos)) {
            this.onClick()
        }
    }
}