import { Component, Point } from "brigsby/dist"
import { LocationManager } from "../LocationManager"
import { ElementType } from "./Elements"

/**
 * A component that all world space entities should have in order to be saveable.
 * Elements should not subclass this.
 */
export class ElementComponent<SaveFormat extends object = object> extends Component {
    readonly type: ElementType
    readonly pos: Point

    constructor(type: ElementType, pos: Point, saveFn: () => SaveFormat) {
        super()
        this.type = type
        this.pos = pos
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
