import { Entity } from "brigsby/dist/Entity"
import { Component } from "brigsby/dist/Component"
import { UpdateData } from "brigsby/dist/Engine"
import { ElementType, Elements } from "../world/elements/Elements"
import { Controls } from "../Controls"
import { Point } from "brigsby/dist/Point"
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
    private count: number = 0

    get isOpen() { return this.element !== null && this.element !== undefined }

    constructor() {
        super()
        PlaceElementDisplay.instance = this
    }

    update(updateData: UpdateData) {
        if (this.count === 0) {
            return
        }

        if (updateData.input.isKeyDown(Controls.closeButton)) {
            this.close()
        }
    }

    close() {
        this.element = null
        this.count = 0
        this.placingFrame.delete()
    }

    startPlacing(element: ElementType, successFn: () => void, count: number) {
        this.element = element
        this.successFn = successFn
        this.count = count
        this.dimensions = Elements.instance.getElementFactory(element).dimensions
        this.placingFrame = Player.instance.entity.addComponent(new PlaceElementFrame(this.dimensions))
    }

    // Should only be called by PlaceElementFrame
    finishPlacing(elementPos: Point) {
        this.count--
        this.successFn()  // remove from inv
        LocationManager.instance.currentLocation.addElement(this.element, elementPos)
        if (this.count === 0) {
            this.close()
        }
    }

    getEntities(): Entity[] {
        return [this.e]
    }

    getElementType() {
        return this.element
    }
}