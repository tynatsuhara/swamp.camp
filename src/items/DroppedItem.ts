import { Component, Point } from "brigsby/dist"
import { PointValue, pt } from "brigsby/dist/Point"
import { BoxCollider, Collider } from "brigsby/dist/collision"
import { SpriteComponent } from "brigsby/dist/sprites"
import { Lists } from "brigsby/dist/util"
import { loadAudio } from "../audio/DeferLoadAudio"
import { Sounds } from "../audio/Sounds"
import { Dude } from "../characters/Dude"
import { session } from "../online/session"
import { syncFn } from "../online/syncUtils"
import { WorldTime } from "../world/WorldTime"
import { requestGameAnimationFrame } from "../world/events/requestGameAnimationFrame"
import { setGameTimeout } from "../world/events/setGameTimeout"
import { here } from "../world/locations/LocationManager"
import { Item } from "./Item"
import { ITEM_METADATA_MAP, ItemMetadata } from "./Items"

// TODO: Find a better sound effect (this one isn't very audible)
const PICK_UP_SOUNDS = loadAudio(
    Lists.range(0, 4).map((i) => `audio/impact/impactWood_medium_00${i}.ogg`)
)

export type DroppedItemSaveState = {
    id: string
    pos: string
    item: Item
    metadata?: ItemMetadata
}

export class DroppedItem extends Component {
    static readonly COLLISION_LAYER = "item"

    private sprite: SpriteComponent
    private collider: Collider
    private itemType: Item
    private itemMetadata: ItemMetadata
    private canPickUp = true

    /**
     * @param position The bottom center where the item should be placed
     * @param sourceCollider will be ignored to prevent physics issues
     */
    constructor(
        private readonly id: string,
        private readonly initialPosition: Point,
        item: Item,
        velocity: Point,
        metadata?: ItemMetadata,
        sourceCollider?: Collider
    ) {
        super()

        this.itemType = item
        this.itemMetadata = this.itemMetadata

        this.start = () => {
            this.sprite = this.entity.addComponent(
                ITEM_METADATA_MAP[item].droppedIconSupplier(metadata).toComponent()
            )
            // the position constructor arg specifies the bottom center
            const pos = initialPosition.minus(this.getPointOffset())
            this.sprite.transform.position = pos

            this.syncPosition = syncFn(id, ({ x, y }: PointValue) => {
                this.sprite.transform.position = pt(x, y)
                this.sprite.transform.depth =
                    this.sprite.transform.position.y + this.sprite.transform.dimensions.y
            })

            if (session.isHost()) {
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

                let last = WorldTime.instance.time
                const move = () => {
                    if (!this.enabled) {
                        return
                    }
                    const now = WorldTime.instance.time
                    const diff = now - last
                    if (diff > 0) {
                        this.reposition(velocity)
                        velocity = velocity.times(0.6)
                    }
                    if (velocity.magnitude() >= 0.1) {
                        requestGameAnimationFrame(move)
                    }
                    last = now
                }
                requestGameAnimationFrame(move)
            }
        }

        this.update = () => {
            this.checkCollision = (dude) => {
                const colliding =
                    dude.standingPosition
                        .plusY(-6)
                        .distanceTo(
                            this.sprite.transform.position.plus(
                                this.sprite.transform.dimensions.div(2)
                            )
                        ) < 12

                if (colliding && this.canPickUp) {
                    this.canPickUp = false
                    setGameTimeout(() => {
                        if (dude.isAlive && !!this.entity) {
                            if (dude.inventory.canAddItem(this.itemType, 1)) {
                                if (session.isHost()) {
                                    dude.inventory.addItem(this.itemType, 1, metadata)
                                }
                                here().removeDroppedItem(this)
                                setGameTimeout(() => {
                                    Sounds.playAtPoint(
                                        Lists.oneOf(PICK_UP_SOUNDS),
                                        0.15,
                                        dude.standingPosition
                                    )
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
    }

    checkCollision: (dude: Dude) => void = () => {}

    save(): DroppedItemSaveState {
        return {
            id: this.id,
            pos: (
                this.sprite?.transform.position.plus(this.getPointOffset()) ?? this.initialPosition
            ).toString(),
            item: this.itemType,
            metadata: this.itemMetadata,
        }
    }

    private getPointOffset() {
        return pt(this.sprite.transform.dimensions.x / 2, this.sprite.transform.dimensions.y)
    }

    private reposition(delta = new Point(0, 0)) {
        const colliderOffset = this.collider.position.minus(this.sprite.transform.position)
        const newPos = this.collider
            .moveTo(this.collider.position.plus(delta))
            .minus(colliderOffset)
        this.syncPosition(newPos)
    }

    private syncPosition: (pos: PointValue) => void
}
