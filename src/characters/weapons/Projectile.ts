import { BoxCollider } from "brigsby/dist/collision/BoxCollider"
import { Component } from "brigsby/dist/Component"
import { Entity } from "brigsby/dist/Entity"
import { Point } from "brigsby/dist/Point"
import { SpriteComponent } from "brigsby/dist/sprites/SpriteComponent"
import { StaticSpriteSource } from "brigsby/dist/sprites/StaticSpriteSource"
import { Lists } from "brigsby/dist/util/Lists"
import { DroppedItem } from "../../items/DroppedItem"
import { Item } from "../../items/Items"
import { LocationManager } from "../../world/LocationManager"
import { Dude } from "../Dude"

class Projectile extends Component {
    private sprite: SpriteComponent
    private collider: BoxCollider
    private itemType: Item

    /**
     * @param position The bottom center where the item should be placed
     * @param sourceCollider will be ignored to prevent physics issues
     */
    constructor(
        position: Point,
        sprite: StaticSpriteSource,
        item: Item,
        velocity: Point,
        attacker: Dude
    ) {
        super()
        this.itemType = item
        this.start = () => {
            this.sprite = this.entity.addComponent(sprite.toComponent())
            const pos = position.minus(
                new Point(
                    this.sprite.transform.dimensions.x / 2,
                    this.sprite.transform.dimensions.y
                )
            )
            this.sprite.transform.position = pos
            this.sprite.transform.rotation = velocity.x > 0 ? 90 : -90
            this.sprite.transform.mirrorX = velocity.x > 0

            const colliderSize = new Point(8, 8)
            const sourceCollider = attacker.entity.getComponent(BoxCollider)

            this.collider = this.entity.addComponent(
                new BoxCollider(
                    pos.plus(new Point(10, 10)),
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
                    if (this.reposition(velocity)) {
                        // collided, short circuit
                        const enemy = this.getEnemy(
                            attacker,
                            this.collider.position.plus(this.collider.dimensions),
                            velocity,
                            20
                        )

                        if (!!enemy) {
                            this.collider.delete()
                            velocity = Point.ZERO

                            // make the projectile stick to the enemy
                            const relativeOffset = this.sprite.transform.position.minus(
                                enemy.animation.transform.position
                            )
                            const relativeDepth =
                                this.sprite.transform.depth - enemy.animation.transform.depth
                            this.sprite.transform.relativeTo(enemy.animation.transform)
                            this.sprite.transform.position = relativeOffset
                            this.sprite.transform.depth = relativeDepth

                            this.sprite.transform.position = new Point(
                                this.sprite.transform.dimensions.y - 10,
                                relativeOffset.y
                            )

                            enemy.damage(
                                1,
                                enemy.standingPosition.minus(attacker.standingPosition),
                                30,
                                attacker
                            )
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

    getEnemy(attacker: Dude, projectilePos: Point, velocity: Point, attackDistance: number): Dude {
        const allEnemies = Array.from(LocationManager.instance.currentLocation.dudes)
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
            this.sprite.transform.position.y + this.sprite.transform.dimensions.y - 14

        const afterPos = this.sprite.transform.position
        return beforePos.distanceTo(afterPos) >= 0.05
    }
}

export const spawnProjectile = (
    pos: Point,
    sprite: StaticSpriteSource,
    item: Item,
    velocity: Point,
    attacker: Dude
) => {
    LocationManager.instance.currentLocation.droppedItems.add(
        new Entity([new Projectile(pos, sprite, item, velocity, attacker)])
    )
}
