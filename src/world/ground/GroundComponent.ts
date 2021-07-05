import { Component } from "brigsby/dist/Component"
import { GroundType } from "./Ground"

/**
 * A component that all world space entities should have in order to be saveable.
 * Elements should no subclass this, 
 */
export class GroundComponent extends Component {

    readonly type: GroundType
    readonly tickExclude: boolean

    constructor(type: GroundType, saveFn: () => object = () => { return {} }, tickExclude = false) {
        super()
        this.type = type
        this.save = saveFn
        this.tickExclude = tickExclude
    }

    save(): object {
        throw new Error("yikes")
    }
}