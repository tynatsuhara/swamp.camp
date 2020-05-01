import { Component } from "../../../engine/component"
import { ElementType } from "./Elements"
import { Point } from "../../../engine/point"

/**
 * A component that all world space entities should have in order to be saveable.
 * Elements should no subclass this, 
 */
export class ElementComponent extends Component {

    readonly type: ElementType
    readonly occupiedPoints: Point[]

    constructor(type: ElementType, occupiedPoints: Point[], saveFn: () => object) {
        super()
        this.type = type
        this.occupiedPoints = occupiedPoints
        this.save = saveFn
    }

    save(): object {
        throw new Error("aaaaahhh!")
    }
}