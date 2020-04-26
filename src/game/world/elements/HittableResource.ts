import { Hittable } from "./Hittable"
import { Point } from "../../../engine/point"
import { TileTransform } from "../../../engine/tiles/TileTransform"
import { spawnItem, Item } from "../../items/Items"
import { TILE_SIZE } from "../../graphics/Tilesets"
import { Entity } from "../../../engine/Entity"
import { Collider } from "../../../engine/collision/Collider"
import { BoxCollider } from "../../../engine/collision/BoxCollider"

export const makeHittable = (e: Entity, pos: Point, transforms: TileTransform[], item: Item) => {
    let knockedItemCount = 5

    const h = new Hittable(
        pos,  // centered position
        transforms, 
        hitDir => {
            knockedItemCount--
            const finishingMove = knockedItemCount === 0
            let velocityMultiplier = finishingMove ? .5 : 1
            let placeDistance = finishingMove ? 2 : 8
            let itemsOut = finishingMove ? 3 : 1

            for (let i = 0; i < itemsOut; i++) {
                const randomness = .5
                const itemDirection = hitDir.plus(new Point(randomness - Math.random() * randomness * 2, randomness - Math.random() * randomness * 2)).normalized()
                const velocity = itemDirection.times(1 + 3 * Math.random())
                spawnItem(
                    pos.plus(new Point(0, TILE_SIZE/2)).plus(itemDirection.times(placeDistance)),  // bottom center, then randomly adjusted
                    item, 
                    velocity.times(velocityMultiplier),
                    e.getComponent(BoxCollider)
                )
            }

            if (finishingMove) {
                e.selfDestruct()
            }
        }
    )

    e.addComponent(h)
}