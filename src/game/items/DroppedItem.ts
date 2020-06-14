import { Component } from "../../engine/component"
import { Point } from "../../engine/point"
import { Collider } from "../../engine/collision/Collider"
import { BoxCollider } from "../../engine/collision/BoxCollider"
import { Player } from "../characters/Player"
import { Dude } from "../characters/Dude"
import { LocationManager } from "../world/LocationManager"
import { ItemMetadata, Item, ITEM_METADATA_MAP } from "./Items"
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
            this.tile = this.entity.addComponent(ITEM_METADATA_MAP[item].droppedIconSupplier().toComponent())
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
            ))

            this.reposition()

            let last = new Date().getTime()
            const move = () => {
                if (!this.enabled) {
                    return
                }
                const now = new Date().getTime()
                const diff = now - last
                if (diff > 0) {
                    this.reposition(velocity)
                    velocity = velocity.times(.6)
                }
                if (velocity.magnitude() >= .1) {
                    requestAnimationFrame(move)
                }
                last = now
            }
            requestAnimationFrame(move)
        }

        this.update = () => {
            const colliding = Player.instance.dude.standingPosition.plusY(-6).distanceTo(position) < 12

            if (colliding) {
                this.update = () => {}
                setTimeout(() => {
                    if (Player.instance.dude.isAlive && !!this.entity) {
                        Player.instance.dude.inventory.addItem(this.itemType)
                        LocationManager.instance.currentLocation.droppedItems.delete(this.entity)
                        this.entity.selfDestruct()
                    }
                }, 150)
            }
        }
    }

    private reposition(delta = new Point(0, 0)) {
        const colliderOffset = this.collider.position.minus(this.tile.transform.position)
        this.tile.transform.position = this.collider.moveTo(this.collider.position.plus(delta)).minus(colliderOffset)
        this.tile.transform.depth = this.tile.transform.position.y + this.tile.transform.dimensions.y
    }
}