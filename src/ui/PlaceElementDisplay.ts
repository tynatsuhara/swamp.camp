import { Component, Entity, Point, UpdateData } from "brigsby/dist"
import { Grid, Maths } from "brigsby/dist/util"
import { Player } from "../characters/Player"
import { controls } from "../Controls"
import { TILE_SIZE } from "../graphics/Tilesets"
import { ItemStack } from "../items/Inventory"
import { ITEM_METADATA_MAP } from "../items/Items"
import { ElementComponent } from "../world/elements/ElementComponent"
import { ElementFactory } from "../world/elements/ElementFactory"
import { Elements, ElementType } from "../world/elements/Elements"
import { ElementUtils } from "../world/elements/ElementUtils"
import { here } from "../world/locations/LocationManager"
import { PlaceElementFrame } from "./PlaceElementFrame"

export class PlaceElementDisplay extends Component {
    static instance: PlaceElementDisplay

    private e: Entity = new Entity([this])

    private stack: ItemStack
    private element: ElementType
    private elementFactory: ElementFactory
    private placingFrame: PlaceElementFrame
    private successFn: () => void
    private replacingElement: ElementComponent | undefined

    get isOpen() {
        return this.element !== null && this.element !== undefined
    }

    constructor() {
        super()
        PlaceElementDisplay.instance = this
    }

    update(updateData: UpdateData) {
        if (!this.stack?.count) {
            return
        }

        if (controls.isCloseMenuButtonDown()) {
            this.close()
        }
    }

    close() {
        this.element = null
        this.stack = null
        this.placingFrame.delete()
    }

    startPlacing(stack: ItemStack, successFn: () => void, replacingElement?: ElementComponent) {
        this.stack = stack
        this.successFn = successFn
        this.replacingElement = replacingElement

        this.element = ITEM_METADATA_MAP[stack.item].element
        this.elementFactory = Elements.instance.getElementFactory(this.element)

        this.placingFrame = Player.instance.entity.addComponent(
            new PlaceElementFrame(this.elementFactory.dimensions, this.replacingElement)
        )
    }

    // Should only be called by PlaceElementFrame
    finishPlacing(elementPos: Point) {
        this.successFn() // decrement and maybe remove from inv
        if (this.replacingElement) {
            here().removeElement(this.replacingElement)
        }

        const data = this.stack.metadata
            ? this.elementFactory.itemMetadataToSaveFormat(this.stack.metadata)
            : undefined

        here().addElement(this.element, elementPos, data)

        // Push if there are any colliders
        const shouldPush = ElementUtils.rectPoints(elementPos, this.elementFactory.dimensions).some(
            (pt) => here().isOccupied(pt)
        )

        // Push dudes out of the way
        if (shouldPush) {
            const p = elementPos.times(TILE_SIZE)
            const d = this.elementFactory.dimensions.times(TILE_SIZE)
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

        if (!this.stack?.count) {
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
