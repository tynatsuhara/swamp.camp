import { Entity } from "../../engine/Entity"
import { Component } from "../../engine/component"
import { UpdateData } from "../../engine/engine"
import { ElementType, Elements } from "../world/elements/Elements"
import { Controls } from "../Controls"
import { Point } from "../../engine/point"
import { LocationManager } from "../world/LocationManager"
import { Player } from "../characters/Player"
import { PlaceElementFrame } from "./PlaceElementFrame"

export class PlaceElementDisplay extends Component {

    static instance: PlaceElementDisplay

    private e: Entity = new Entity([this])

    private element: ElementType
    private dimensions: Point
    private placingFrame: PlaceElementFrame
    private successFn: () => void

    get isOpen() { return !!this.element }

    constructor() {
        super()
        PlaceElementDisplay.instance = this
    }

    update(updateData: UpdateData) {
        if (!this.element) {
            return
        }

        if (updateData.input.isKeyDown(Controls.closeButton)) {
            this.close()
        }
    }

    close() {
        this.element = null
        this.placingFrame.delete()
    }

    startPlacing(element: ElementType, successFn: () => void) {
        this.element = element
        this.successFn = successFn
        this.dimensions = Elements.instance.dimensions(element)
        this.placingFrame = Player.instance.entity.addComponent(new PlaceElementFrame(this.dimensions))
    }

    // Should only be called by PlaceElementFrame
    finishPlacing(elementPos: Point) {
        this.successFn()  // remove from inv
        LocationManager.instance.currentLocation.addWorldElement(this.element, elementPos)
        this.close()
    }

    getEntities(): Entity[] {
        return [this.e]
    }
}