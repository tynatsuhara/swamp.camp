import { Component, Entity, Point, UpdateData } from "brigsby/dist"
import { PointValue, pt } from "brigsby/dist/Point"
import { Grid, Maths } from "brigsby/dist/util"
import { player } from "../characters/player"
import { controls } from "../Controls"
import { TILE_SIZE } from "../graphics/Tilesets"
import { ItemStack } from "../items/Inventory"
import { ITEM_METADATA_MAP } from "../items/Items"
import { Singletons } from "../Singletons"
import { ElementFactory } from "../world/elements/ElementFactory"
import { Elements, ElementType } from "../world/elements/Elements"
import { ElementUtils } from "../world/elements/ElementUtils"
import { here } from "../world/locations/LocationManager"
import { PlaceElementFrame } from "./PlaceElementFrame"

export class PlaceElementDisplay extends Component {
    static get instance() {
        return Singletons.getOrCreate(PlaceElementDisplay)
    }

    private e: Entity = new Entity([this])

    private stack: ItemStack
    private element: ElementType
    private elementFactory: ElementFactory<any>
    private placingFrame: PlaceElementFrame
    private successFn: (elementPos: Point) => void

    get isOpen() {
        return this.element !== null && this.element !== undefined
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
        this.placingFrame?.delete()
    }

    startPlacing(stack: ItemStack, successFn: (elementPos: Point) => void) {
        this.stack = stack
        this.successFn = successFn

        this.element = ITEM_METADATA_MAP[stack.item].element
        this.elementFactory = Elements.instance.getElementFactory(this.element)

        this.placingFrame = player().entity.addComponent(
            new PlaceElementFrame(this.elementFactory.dimensions)
        )
    }

    finishPlacingOnHost(stack: ItemStack, elementPos: PointValue) {
        const itemMetadata = ITEM_METADATA_MAP[stack.item]
        const element = itemMetadata.element

        if (element === undefined || stack.count === 0) {
            console.warn(`cannot place stack: ${JSON.stringify(stack)}`)
            return
        }

        const elementFactory = Elements.instance.getElementFactory(element)

        const data = stack.metadata
            ? elementFactory.itemMetadataToSaveFormat(stack.metadata)
            : undefined

        const addedElement = here().addElement(element, elementPos, data)

        if (!addedElement) {
            console.warn(`failed to place element: ${JSON.stringify(stack)}`)
            return
        }

        // Push if there are any colliders
        const shouldPush = ElementUtils.rectPoints(elementPos, elementFactory.dimensions).some(
            (pt) => here().isOccupied(pt)
        )

        // Push dudes out of the way
        if (shouldPush) {
            const p = pt(elementPos.x, elementPos.y).times(TILE_SIZE)
            const d = elementFactory.dimensions.times(TILE_SIZE)
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
    }

    // Should only be called by PlaceElementFrame
    finishPlacing(elementPos: Point) {
        this.stack = this.stack.withCount(this.stack.count - 1)

        this.successFn(elementPos) // remove from inventory and call doPlacingOnHost (on host)

        if (this.stack.count === 0) {
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
