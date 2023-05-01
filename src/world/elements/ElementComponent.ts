import { Component, Point } from "brigsby/dist"
import { session } from "../../online/session"
import { LocationManager } from "../locations/LocationManager"
import { ElementType } from "./ElementType"

/**
 * A component that all world space entities should have in order to be saveable.
 * Elements should not subclass this.
 */
export class ElementComponent<
    Type extends ElementType,
    SaveFormat extends object = object
> extends Component {
    constructor(readonly type: Type, readonly pos: Point, readonly save: () => SaveFormat) {
        super()
    }

    delete() {
        super.delete()
        if (session.isHost()) {
            LocationManager.instance.getLocations().forEach((l) => {
                if (l.getElement(this.pos) === this) {
                    l.removeElementAt(this.pos.x, this.pos.y)
                }
            })
        }
    }
}
