import { Component, Entity, Point } from "brigsby/dist"
import { BoxCollider } from "brigsby/dist/collision"
import { SpriteComponent } from "brigsby/dist/sprites"
import { Lists } from "brigsby/dist/util"
import { DroppedItem } from "../../items/DroppedItem"
import { Item } from "../../items/Items"
import { here } from "../../world/LocationManager"
import { Dude } from "../Dude"

class Projectile extends Component {
    private sprite: SpriteComponent
    private collider: BoxCollider
    private itemType: Item

    /**
     * @param position The bottom center where the item should be placed
     * @param sourceCollider will be ignored to prevent physics issues
     */
    constructor(sprite: SpriteComponent, tip: Point, item: Item, velocity: Point, attacker: Dude) {
        super()
        this.itemType = item
        this.start = () => {
            this.sprite = this.entity.addComponent(sprite)
            // this.sprite.transform.position = sprite.transform.position.minus(
            //     new Point(
            //         this.sprite.transform.dimensions.x / 2,
            //         this.sprite.transform.dimensions.y
            //     )
            // )
            // this.sprite.transform.rotation = velocity.x > 0 ? 90 : -90
            // this.sprite.transform.mirrorX = velocity.x > 0

            const sourceCollider = attacker.entity.getComponent(BoxCollider)

            const colliderRadius = 2

            this.collider = this.entity.addComponent(
                new BoxCollider(
                    tip.plus(new Point(-colliderRadius, -colliderRadius)),
                    new Point(2, 2).times(colliderRadius),
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
                    if (this.reposition(velocity)) {
                        // collided, short circuit
                        const enemy = this.getEnemy(
                            attacker,
                            this.collider.position.plus(this.collider.dimensions),
                            20
                        )

                        if (enemy) {
                            // this.collider.delete()  // TODO
                            velocity = Point.ZERO

                            // make the projectile stick to the enemy
                            // const relativeOffset = this.sprite.transform.position.minus(
                            //     enemy.animation.transform.position
                            // )
                            // const relativeDepth =
                            //     this.sprite.transform.depth - enemy.animation.transform.depth
                            // const isMirrored = this.sprite.transform.mirrorX
                            // this.sprite.transform.relativeTo(enemy.animation.transform)
                            // this.sprite.transform.position = relativeOffset
                            // this.sprite.transform.depth = relativeDepth
                            // if (enemy.animation.transform.mirrorX) {
                            //     this.sprite.transform.mirrorX = !isMirrored
                            // }

                            // this.sprite.transform.position = new Point(
                            //     this.sprite.transform.dimensions.y - 10,
                            //     relativeOffset.y
                            // )

                            enemy.damage(1, {
                                direction: enemy.standingPosition.minus(attacker.standingPosition),
                                knockback: 30,
                                attacker,
                            })
                        }
                    }
                    velocity = velocity.times(0.6)
                }
                if (velocity.magnitude() >= 0.1) {
                    requestAnimationFrame(move)
                } else {
                    setTimeout(() => this.entity.selfDestruct(), 5000)
                }
                last = now
            }
            requestAnimationFrame(move)
        }
    }

    getEnemy(attacker: Dude, projectilePos: Point, attackDistance: number): Dude {
        const allEnemies = here()
            .getDudes()
            .filter((d) => !!d && d !== attacker && d.isEnemy(attacker))
            .filter((d) => d.standingPosition.distanceTo(projectilePos) < attackDistance)

        return Lists.minBy(allEnemies, (d) => d.standingPosition.manhattanDistanceTo(projectilePos))
    }

    /**
     * returns true if it successfully moved
     */
    private reposition(delta = new Point(0, 0)): boolean {
        const colliderOffset = this.collider.position.minus(this.sprite.transform.position)
        const beforePos = this.sprite.transform.position

        this.sprite.transform.position = this.collider
            .moveTo(this.collider.position.plus(delta).apply(Math.floor))
            .minus(colliderOffset)
        this.sprite.transform.depth =
            this.sprite.transform.position.y + this.sprite.transform.dimensions.y

        const afterPos = this.sprite.transform.position
        return beforePos.distanceTo(afterPos) >= 0.05
    }
}

/**
 * @param sprite
 * @param tip global position
 * @param item
 * @param velocity
 * @param attacker
 */
export const spawnProjectile = (
    sprite: SpriteComponent,
    tip: Point,
    item: Item,
    velocity: Point,
    attacker: Dude
) => {
    here().droppedItems.add(new Entity([new Projectile(sprite, tip, item, velocity, attacker)]))
}
