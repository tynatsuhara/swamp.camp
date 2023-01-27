import { Component } from "brigsby/dist"
import { GroundType } from "./Ground"

/**
 * A component that all world space entities should have in order to be saveable.
 * Elements should no subclass this,
 */
export class GroundComponent extends Component {
    constructor(
        readonly type: GroundType,
        readonly save: () => object = () => {
            return {}
        },
        readonly tickExclude = false
    ) {
        super()
    }
}
