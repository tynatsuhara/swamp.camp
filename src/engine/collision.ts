import { Component } from "./component";
import { StartData, UpdateData } from "./engine";
import { Point } from "./point";
import { RenderMethod } from "./renderer/renderer";
import { LineRender } from "./renderer/LineRender";
import { DEBUG } from "./debug";

export class BoxCollider extends Component {

    private dirty: Boolean = true

    private position: Point  // top-left
    private dimensions: Point  

    constructor(position: Point, dimensions: Point) {
        super()
        this.position = position
        this.dimensions = dimensions
    }

    start(startData: StartData) {}
    
    update(updateData: UpdateData) {
        if (!this.dirty) {
            return
        }

        this.dirty = false
    }

    moveTo(point: Point): Point {
        // TODO: figure out how we want to do collision!
        this.position = point
        return this.position
    }

    getRenderMethods(): RenderMethod[] {
        if (!DEBUG.showColliders) {
            return []
        }
        return [
            new LineRender(this.position, this.position.plus(new Point(this.dimensions.x, 0))),
            new LineRender(this.position, this.position.plus(new Point(0, this.dimensions.y))),
            new LineRender(this.position.plus(this.dimensions), this.position.plus(new Point(this.dimensions.x, 0))),
            new LineRender(this.position.plus(this.dimensions), this.position.plus(new Point(0, this.dimensions.y))),
        ]
    }
}