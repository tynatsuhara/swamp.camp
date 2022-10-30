import { Component, Point } from "brigsby/dist"
import { BoxCollider, Collider } from "brigsby/dist/collision"
import { SpriteComponent } from "brigsby/dist/sprites"
import { Lists } from "brigsby/dist/util"
import { loadAudio } from "../audio/DeferLoadAudio"
import { Sounds } from "../audio/Sounds"
import { player } from "../characters/player"
import { here } from "../world/locations/LocationManager"
import { Item, ItemMetadata, ITEM_METADATA_MAP } from "./Items"

// TODO: Find a better sound effect (this one isn't very audible)
const PICK_UP_SOUNDS = Lists.range(0, 4).map((i) => `audio/impact/impactWood_medium_00${i}.ogg`)

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
    constructor(
        position: Point,
        item: Item,
        velocity: Point,
        sourceCollider: Collider,
        metadata?: ItemMetadata
    ) {
        super()

        loadAudio(PICK_UP_SOUNDS)

        this.itemType = item
        this.start = () => {
            this.sprite = this.entity.addComponent(
                ITEM_METADATA_MAP[item].droppedIconSupplier().toComponent()
            )
            const pos = position.minus(
                new Point(
                    this.sprite.transform.dimensions.x / 2,
                    this.sprite.transform.dimensions.y
                )
            )
            this.sprite.transform.position = pos

            const colliderSize = new Point(8, 8)
            this.collider = this.entity.addComponent(
                new BoxCollider(
                    pos.plus(this.sprite.transform.dimensions.minus(colliderSize).div(2)),
                    colliderSize,
                    DroppedItem.COLLISION_LAYER,
                    !!sourceCollider ? [sourceCollider] : []
                )
            )

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
                    velocity = velocity.times(0.6)
                }
                if (velocity.magnitude() >= 0.1) {
                    requestAnimationFrame(move)
                }
                last = now
            }
            requestAnimationFrame(move)
        }

        this.update = () => {
            const colliding = player().dude.standingPosition.plusY(-6).distanceTo(position) < 12

            if (colliding && this.canPickUp) {
                this.canPickUp = false
                setTimeout(() => {
                    if (player().dude.isAlive && !!this.entity) {
                        if (player().dude.inventory.addItem(this.itemType, 1, metadata)) {
                            here().droppedItems.delete(this.entity)
                            this.entity.selfDestruct()
                            setTimeout(() => {
                                Sounds.play(Lists.oneOf(PICK_UP_SOUNDS), 0.15)
                            }, Math.random() * 350)
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
        this.sprite.transform.position = this.collider
            .moveTo(this.collider.position.plus(delta))
            .minus(colliderOffset)
        this.sprite.transform.depth =
            this.sprite.transform.position.y + this.sprite.transform.dimensions.y
    }
}
