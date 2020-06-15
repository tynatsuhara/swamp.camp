import { Hittable } from "./Hittable"
import { Point } from "../../../engine/point"
import { TileTransform } from "../../../engine/tiles/TileTransform"
import { spawnItem, ItemMetadata, Item } from "../../items/Items"
import { TILE_SIZE } from "../../graphics/Tilesets"
import { Entity } from "../../../engine/Entity"
import { Collider } from "../../../engine/collision/Collider"
import { BoxCollider } from "../../../engine/collision/BoxCollider"
import { LocationManager } from "../LocationManager"
import { ElementComponent } from "./ElementComponent"

export class HittableResource extends Hittable {

    freeResources: number
    private itemSupplier: () => Item

    constructor(position: Point, tileTransforms: TileTransform[], itemSupplier: () => Item, freeResources: number) {
        super(position, tileTransforms, hitDir => this.hitCallback(hitDir))
        this.itemSupplier = itemSupplier
        this.freeResources = freeResources
    }

    private hitCallback(hitDir: Point) {
        this.freeResources--

        if (this.freeResources < 0 && this.freeResources > -4) {
            return
        }

        const finishingMove = this.freeResources < 0
        let velocityMultiplier = finishingMove ? .6 : 1
        let placeDistance = finishingMove ? 2 : 8
        let itemsOut = finishingMove ? 3 : 1

        for (let i = 0; i < itemsOut; i++) {
            const randomness = .5
            const itemDirection = hitDir.plus(new Point(randomness - Math.random() * randomness * 2, randomness - Math.random() * randomness * 2)).normalized()
            const velocity = itemDirection.times(1 + 3 * Math.random())
            spawnItem(
                this.position.plus(new Point(0, TILE_SIZE/2)).plus(itemDirection.times(placeDistance)),  // bottom center, then randomly adjusted
                this.itemSupplier(), 
                velocity.times(velocityMultiplier),
                this.entity.getComponent(BoxCollider)
            )
        }

        if (finishingMove) {
            LocationManager.instance.currentLocation.elements.removeAll(this.entity.getComponent(ElementComponent))
            this.entity.selfDestruct()
        }
    }
}