import { Component } from "../../../engine/Component"
import { ElementType } from "./Elements"
import { Point } from "../../../engine/Point"
import { LocationManager } from "../LocationManager"

/**
 * A component that all world space entities should have in order to be saveable.
 * Elements should not subclass this.
 */
export class ElementComponent extends Component {

    readonly type: ElementType
    readonly pos: Point  // TODO: do we need to add this?
    readonly occupiedPoints: Point[]  // these are the points that are non-walkable

    constructor(type: ElementType, pos: Point, occupiedPoints: Point[], saveFn: () => object) {
        super()
        this.type = type
        this.pos = pos
        this.occupiedPoints = occupiedPoints
        this.save = saveFn
    }

    save(): object {
        throw new Error("aaaaahhh!")
    }

    delete() {
        super.delete()
        LocationManager.instance.getLocations().forEach(l => l.removeElement(this))
    }
}