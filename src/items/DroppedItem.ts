import { BoxCollider } from "brigsby/dist/collision/BoxCollider"
import { Collider } from "brigsby/dist/collision/Collider"
import { Component } from "brigsby/dist/Component"
import { Point } from "brigsby/dist/Point"
import { SpriteComponent } from "brigsby/dist/sprites/SpriteComponent"
import { Player } from "../characters/Player"
import { LocationManager } from "../world/LocationManager"
import { Item, ITEM_METADATA_MAP } from "./Items"
import { saveManager } from "../SaveManager"

export class DroppedItem extends Component {

    static readonly COLLISION_LAYER = "item"

    private sprite: SpriteComponent
    private collider: Collider
    private itemType: Item
    private canPickUp = true

    /**
     * @param position The bottom center where the item should be placed
     * @param sourceCollider will be ignored to prevent physics issues
     */
    constructor(position: Point, item: Item, velocity: Point, sourceCollider: Collider = null) {
        super()
        this.itemType = item
        this.start = () => {
            this.sprite = this.entity.addComponent(ITEM_METADATA_MAP[item].droppedIconSupplier().toComponent())
            const pos = position.minus(new Point(
                this.sprite.transform.dimensions.x/2,
                this.sprite.transform.dimensions.y
            ))
            this.sprite.transform.position = pos

            const colliderSize = new Point(8, 8)
            this.collider = this.entity.addComponent(new BoxCollider(
                pos.plus(this.sprite.transform.dimensions.minus(colliderSize).div(2)), 
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

            if (colliding && this.canPickUp) {
                this.canPickUp = false
                setTimeout(() => {
                    if (Player.instance.dude.isAlive && !!this.entity) {
                        if (this.itemType === Item.COIN) {
                            saveManager.setState({ 
                                coins: saveManager.getState().coins + 1 
                            })
                        }

                        if (this.itemType === Item.COIN || Player.instance.dude.inventory.addItem(this.itemType)) {
                            LocationManager.instance.currentLocation.droppedItems.delete(this.entity)
                            this.entity.selfDestruct()
                            return
                        }
                        
                        // inventory is full
                        this.canPickUp = true
                    }
                }, 150)
            }
        }
    }

    private reposition(delta = new Point(0, 0)) {
        const colliderOffset = this.collider.position.minus(this.sprite.transform.position)
        this.sprite.transform.position = this.collider.moveTo(this.collider.position.plus(delta)).minus(colliderOffset)
        this.sprite.transform.depth = this.sprite.transform.position.y + this.sprite.transform.dimensions.y
    }
}