import { BoxCollider } from "../../../engine/collision/BoxCollider"
import { Collider } from "../../../engine/collision/Collider"
import { CollisionEngine } from "../../../engine/collision/CollisionEngine"
import { Component } from "../../../engine/Component"
import { Entity } from "../../../engine/Entity"
import { Point } from "../../../engine/Point"
import { StaticTileSource } from "../../../engine/tiles/StaticTileSource"
import { TileComponent } from "../../../engine/tiles/TileComponent"
import { Item } from "../../items/Items"
import { LocationManager } from "../../world/LocationManager"
import { Weapon } from "./Weapon"
import { Dude } from "../Dude"
import { DroppedItem } from "../../items/DroppedItem"
import { Lists } from "../../../engine/util/Lists"

class Projectile extends Component {

    private tile: TileComponent
    private collider: BoxCollider
    private itemType: Item

    /**
     * @param position The bottom center where the item should be placed
     * @param sourceCollider will be ignored to prevent physics issues
     */
    constructor(position: Point, sprite: StaticTileSource, item: Item, velocity: Point, attacker: Dude) {
        super()
        this.itemType = item
        this.start = () => {
            this.tile = this.entity.addComponent(sprite.toComponent())
            const pos = position.minus(new Point(
                this.tile.transform.dimensions.x/2,
                this.tile.transform.dimensions.y
            ))
            this.tile.transform.position = pos
            this.tile.transform.rotation = velocity.x > 0 ? 90 : -90
            this.tile.transform.mirrorX = velocity.x > 0

            const colliderSize = new Point(8, 8)
            const sourceCollider = attacker.entity.getComponent(BoxCollider)

            this.collider = this.entity.addComponent(new BoxCollider(
                pos.plus(new Point(10, 10)), 
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
                            const relativeOffset = this.tile.transform.position.minus(enemy.animation.transform.position)
                            const relativeDepth = this.tile.transform.depth - enemy.animation.transform.depth
                            this.tile.transform.relativeTo(enemy.animation.transform)
                            this.tile.transform.position = relativeOffset
                            this.tile.transform.depth = relativeDepth

                            this.tile.transform.position = new Point(this.tile.transform.dimensions.y - 10, relativeOffset.y)

                            enemy.damage(1, enemy.standingPosition.minus(attacker.standingPosition), 30)
                        }
                    }
                    velocity = velocity.times(.6)
                }
                if (velocity.magnitude() >= .1) {
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
                .filter(d => !!d && d !== attacker && d.isEnemy(attacker))
                .filter(d => d.standingPosition.distanceTo(projectilePos) < attackDistance)

        return Lists.minBy(
            allEnemies,
            d => d.standingPosition.manhattanDistanceTo(projectilePos)
        )
    }

    /**
     * returns true if it successfully moved
     */
    private reposition(delta = new Point(0, 0)): boolean {
        const colliderOffset = this.collider.position.minus(this.tile.transform.position)
        const beforePos = this.tile.transform.position

        this.tile.transform.position = this.collider.moveTo(this.collider.position.plus(delta).apply(Math.floor)).minus(colliderOffset)
        this.tile.transform.depth = this.tile.transform.position.y + this.tile.transform.dimensions.y - 14

        const afterPos = this.tile.transform.position
        return beforePos.distanceTo(afterPos) >= 0.05
    }
}

export const spawnProjectile = (
    pos: Point, 
    sprite: StaticTileSource, 
    item: Item, 
    velocity: Point, 
    attacker: Dude
) => {
    LocationManager.instance.currentLocation.droppedItems.add(new Entity([
        new Projectile(pos, sprite, item, velocity, attacker)
    ]))
}