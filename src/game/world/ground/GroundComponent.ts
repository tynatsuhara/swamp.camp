import { Component } from "../../../engine/component"
import { GroundType } from "./Ground"

/**
 * A component that all world space entities should have in order to be saveable.
 * Elements should no subclass this, 
 */
export class GroundComponent extends Component {

    readonly type: GroundType

    constructor(type: GroundType, saveFn: () => object = () => { return {} }) {
        super()
        this.type = type
        this.save = saveFn
    }

    save(): object {
        throw new Error("yikes")
    }
}