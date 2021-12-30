import { Component } from "brigsby/dist/Component"
import { Point } from "brigsby/dist/Point"
import { LocationManager } from "../LocationManager"
import { ElementType } from "./Elements"

/**
 * A component that all world space entities should have in order to be saveable.
 * Elements should not subclass this.
 */
export class ElementComponent<SaveFormat extends object = object> extends Component {
    readonly type: ElementType
    readonly pos: Point // TODO: do we need to add this?
    readonly occupiedPoints: Point[] // these are the points that are non-walkable

    constructor(type: ElementType, pos: Point, occupiedPoints: Point[], saveFn: () => SaveFormat) {
        super()
        this.type = type
        this.pos = pos
        this.occupiedPoints = occupiedPoints
        this.save = saveFn
    }

    save(): SaveFormat {
        throw new Error("aaaaahhh!")
    }

    delete() {
        super.delete()
        LocationManager.instance.getLocations().forEach((l) => l.removeElement(this))
    }
}
