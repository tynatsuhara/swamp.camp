import { Component } from "../../../engine/component"
import { Point } from "../../../engine/point"
import { Item } from "../../items/Items"
import { Collider } from "../../../engine/collision/Collider"
import { LocationManager } from "../../world/LocationManager"
import { Entity } from "../../../engine/Entity"

class Projectile extends Component {

}

// export const spawnProjectile = (pos: Point, item: Item, velocity: Point = new Point(0, 0), sourceCollider: Collider = null) => {
//     LocationManager.instance.currentLocation.droppedItems.add(new Entity([
//         new Projectile(pos, item, velocity, sourceCollider)
//     ]))
// }