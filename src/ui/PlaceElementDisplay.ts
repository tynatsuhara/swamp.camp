import { Component, Entity, Point, UpdateData } from "brigsby/lib"
import { Grid, Maths } from "brigsby/lib/util"
import { Player } from "../characters/Player"
import { controls } from "../Controls"
import { TILE_SIZE } from "../graphics/Tilesets"
import { ElementComponent } from "../world/elements/ElementComponent"
import { Elements, ElementType } from "../world/elements/Elements"
import { ElementUtils } from "../world/elements/ElementUtils"
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

        // Push if there are any colliders
        const shouldPush = ElementUtils.rectPoints(elementPos, this.dimensions).some((pt) =>
            here().isOccupied(pt)
        )

        // Push dudes out of the way
        if (shouldPush) {
            const p = elementPos.times(TILE_SIZE)
            const d = this.dimensions.times(TILE_SIZE)
            const intersectingDudes = here()
                .getDudes()
                .filter((dude) => Maths.rectContains(p, d, dude.standingPosition))

            intersectingDudes.forEach((d) => {
                // If they're in an unoccupied tile, still center them so that they don't clip through walls
                const newPos = here().isOccupied(d.tile)
                    ? Grid.spiralSearch(d.tile, (p) => !here().isOccupied(p))
                    : d.tile
                // put them in the center of that tile
                d.moveTo(newPos.plus(new Point(0.5, 0.75)).times(TILE_SIZE), true)
            })
        }

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
