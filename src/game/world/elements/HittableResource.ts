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

    private static negativeThreshold = -4

    freeResources: number
    readonly maxResources: number
    private itemSupplier: () => Item[]    

    constructor(position: Point, tileTransforms: TileTransform[], freeResources: number, maxResources: number, itemSupplier: () => Item[]) {
        super(position, tileTransforms, hitDir => this.hitCallback(hitDir))
        this.freeResources = freeResources
        this.maxResources = maxResources
        this.itemSupplier = itemSupplier
    }

    private hitCallback(hitDir: Point) {
        this.freeResources--

        if (this.freeResources < 0 && this.freeResources > HittableResource.negativeThreshold) {
            return
        }

        const finishingMove = this.freeResources < 0
        let velocityMultiplier = finishingMove ? .6 : 1
        let placeDistance = finishingMove ? 2 : 8
        let itemsOut = finishingMove ? 3 : 1

        for (let i = 0; i < itemsOut; i++) {
            const items = this.itemSupplier()
            for (const item of items) {
                const randomness = .5
                const itemDirection = hitDir.plus(new Point(randomness - Math.random() * randomness * 2, randomness - Math.random() * randomness * 2)).normalized()
                const velocity = itemDirection.times(1 + 3 * Math.random())
                spawnItem(
                    this.position.plus(new Point(0, TILE_SIZE/2)).plus(itemDirection.times(placeDistance)),  // bottom center, then randomly adjusted
                    item, 
                    velocity.times(velocityMultiplier),
                    this.entity.getComponent(BoxCollider)
                )
            }
        }

        if (finishingMove) {
            LocationManager.instance.currentLocation.elements.removeAll(this.entity.getComponent(ElementComponent))
            this.entity.selfDestruct()
        }
    }

    // TODO actually call this 
    replenish() {
        if (!!this.entity && this.enabled) {
            this.freeResources = Math.min(Math.max(this.freeResources + 1, 0), this.maxResources)
        }
    }
}