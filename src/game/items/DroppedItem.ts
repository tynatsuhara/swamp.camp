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
    private itemType: Item

    /**
     * @param position The bottom center where the item should be placed
     * 
     * TODO: Add initial velocity
     */
    constructor(position: Point, item: Item, velocity: Point) {
        velocity = velocity.normalized().times(2 + 5 * Math.random())

        super()
        this.itemType = item
        this.start = () => {
            this.tile = this.entity.addComponent(item.droppedIconSupplier().toComponent())
            const pos = position.minus(new Point(
                this.tile.transform.dimensions.x/2,
                this.tile.transform.dimensions.y
            ))
            this.tile.transform.position = pos
            this.reposition()

            this.entity.addComponent(
                new BoxCollider(pos, this.tile.transform.dimensions, DroppedItem.COLLISION_LAYER).onColliderEnter(c => this.collide(c))
            )
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
        this.tile.transform.position = this.tile.transform.position.plus(delta)
        this.tile.transform.depth = this.tile.transform.position.y
    }

    private collide(c: Collider) {
        const player = c.entity.getComponent(Player)
        if (!!player) {
            const d = player.entity.getComponent(Dude)
            if (d.isAlive) {
                player.entity.getComponent(Dude).inventory.addItem(this.itemType)
                LocationManager.instance.currentLocation.dynamic.delete(this.entity)
                this.entity.selfDestruct()
            }
        }
    }
}