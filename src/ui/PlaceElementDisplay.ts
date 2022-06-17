import { Component } from "brigsby/dist/Component"
import { UpdateData } from "brigsby/dist/Engine"
import { Entity } from "brigsby/dist/Entity"
import { Point } from "brigsby/dist/Point"
import { Player } from "../characters/Player"
import { controls } from "../Controls"
import { ElementComponent } from "../world/elements/ElementComponent"
import { Elements, ElementType } from "../world/elements/Elements"
import { here } from "../world/LocationManager"
import { PlaceElementFrame } from "./PlaceElementFrame"

export class PlaceElementDisplay extends Component {
    static instance: PlaceElementDisplay

    private e: Entity = new Entity([this])

    private element: ElementType
    private dimensions: Point
    private placingFrame: PlaceElementFrame
    private successFn: () => void
    private count: number = 0
    private replacingElement: ElementComponent | undefined

    get isOpen() {
        return this.element !== null && this.element !== undefined
    }

    constructor() {
        super()
        PlaceElementDisplay.instance = this
    }

    update(updateData: UpdateData) {
        if (this.count === 0) {
            return
        }

        if (controls.isCloseMenuButtonDown()) {
            this.close()
        }
    }

    close() {
        this.element = null
        this.count = 0
        this.placingFrame.delete()
    }

    startPlacing(
        element: ElementType,
        successFn: () => void,
        count: number,
        replacingElement?: ElementComponent
    ) {
        this.element = element
        this.successFn = successFn
        this.count = count
        this.replacingElement = replacingElement
        this.dimensions = Elements.instance.getElementFactory(element).dimensions
        this.placingFrame = Player.instance.entity.addComponent(
            new PlaceElementFrame(this.dimensions, this.replacingElement)
        )
    }

    // Should only be called by PlaceElementFrame
    finishPlacing(elementPos: Point) {
        this.count--
        this.successFn() // remove from inv
        if (this.replacingElement) {
            here().removeElement(this.replacingElement)
        }
        here().addElement(this.element, elementPos)
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
