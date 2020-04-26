import { Component } from "../../engine/component"
import { AnimatedTileComponent } from "../../engine/tiles/AnimatedTileComponent"
import { Point } from "../../engine/point"
import { Tilesets } from "../graphics/Tilesets"
import { Collider } from "../../engine/collision/Collider"
import { BoxCollider } from "../../engine/collision/BoxCollider"
import { Player } from "../characters/Player"
import { Dude } from "../characters/Dude"
import { LocationManager } from "../world/LocationManager"
import { TileSetAnimation } from "../../engine/tiles/TileSetAnimation"
import { Item } from "./Items"
import { TileComponent } from "../../engine/tiles/TileComponent"

export class DroppedItem extends Component {

    static readonly COLLISION_LAYER = "item"

    private tile: TileComponent
    private collider: Collider
    private itemType: Item

    /**
     * @param position The bottom center where the item should be placed
     * @param sourceCollider will be ignored to prevent physics issues
     * 
     * TODO: Add initial velocity
     */
    constructor(position: Point, item: Item, velocity: Point, sourceCollider: Collider = null) {
        super()
        this.itemType = item
        this.start = () => {
            this.tile = this.entity.addComponent(item.droppedIconSupplier().toComponent())
            const pos = position.minus(new Point(
                this.tile.transform.dimensions.x/2,
                this.tile.transform.dimensions.y
            ))
            this.tile.transform.position = pos

            const colliderSize = new Point(8, 8)
            this.collider = this.entity.addComponent(new BoxCollider(
                pos.plus(this.tile.transform.dimensions.minus(colliderSize).div(2)), 
                colliderSize, 
                DroppedItem.COLLISION_LAYER,
                !!sourceCollider ? [sourceCollider] : []
            ).onColliderEnter(c => this.collide(c)))

            this.reposition()
        }

        const moveInterval = setInterval(() => {
            this.reposition(velocity)
            velocity = velocity.times(.6)
            if (velocity.magnitude() < .1) {
                clearInterval(moveInterval)
            }
        }, 10)
    }

    private reposition(delta = new Point(0, 0)) {
        const colliderOffset = this.collider.position.minus(this.tile.transform.position)
        this.tile.transform.position = this.collider.moveTo(this.collider.position.plus(delta)).minus(colliderOffset)
        this.tile.transform.depth = this.tile.transform.position.y
    }

    private collide(c: Collider) {
        const player = c.entity.getComponent(Player)
        if (!!player) {
            setTimeout(() => {
                const d = player.entity.getComponent(Dude)
                if (d.isAlive) {
                    player.entity.getComponent(Dude).inventory.addItem(this.itemType)
                    LocationManager.instance.currentLocation.dynamic.delete(this.entity)
                    this.entity.selfDestruct()
                }
            }, 150)
        }
    }
}