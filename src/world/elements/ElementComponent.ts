import { Component, Point } from "brigsby/dist"
import { LocationManager } from "../locations/LocationManager"
import { ElementType } from "./Elements"

/**
 * A component that all world space entities should have in order to be saveable.
 * Elements should not subclass this.
 */
export class ElementComponent<
    Type extends ElementType,
    SaveFormat extends object = object
> extends Component {
    readonly type: Type
    readonly pos: Point

    constructor(type: Type, pos: Point, saveFn: () => SaveFormat) {
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
        LocationManager.instance.getLocations().forEach((l) => {
            if (l.getElement(this.pos) === this) {
                l.removeElementAt(this.pos.x, this.pos.y)
            }
        })
    }
}
