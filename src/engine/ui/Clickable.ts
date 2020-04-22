import { Component } from "../component";
import { UpdateData } from "../engine";
import { Point } from "../point";
import { rectContains } from "../util/utils";

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