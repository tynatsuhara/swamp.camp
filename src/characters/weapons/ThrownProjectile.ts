import { Component, Entity, Point } from "brigsby/dist"
import { BoxCollider } from "brigsby/dist/collision"
import { SpriteComponent } from "brigsby/dist/sprites"
import { Lists } from "brigsby/dist/util"
import { DroppedItem } from "../../items/DroppedItem"
import { session } from "../../online/session"
import { now } from "../../world/WorldTime"
import { GroundRenderer } from "../../world/ground/GroundRenderer"
import { here } from "../../world/locations/LocationManager"
import { Dude } from "../Dude"

const flightTime = 150

class ThrownProjectile extends Component {
    private sprite: SpriteComponent
    private collider: BoxCollider
    private velocity: Point
    private attacker: Dude
    private throwTime: number

    /**
     * @param position The bottom center where the item should be placed
     * @param sourceCollider will be ignored to prevent physics issues
     */
    constructor(sprite: SpriteComponent, tip: Point, velocity: Point, attacker: Dude) {
        super()
        this.start = () => {
            this.sprite = this.entity.addComponent(sprite)
            this.velocity = velocity
            this.attacker = attacker
            this.throwTime = now()

            const sourceCollider = this.attacker.entity.getComponent(BoxCollider)

            const colliderRadius = 2

            this.collider = this.entity.addComponent(
                new BoxCollider(
                    tip.plus(new Point(-colliderRadius, -colliderRadius)),
                    new Point(2, 2).times(colliderRadius),
                    DroppedItem.COLLISION_LAYER,
                    !!sourceCollider ? [sourceCollider] : []
                )
            )
        }
    }

    update({ elapsedTimeMillis }) {
        const colliderOffset = this.collider.position.minus(this.sprite.transform.position)
        const beforePos = this.sprite.transform.position

        this.sprite.transform.position = this.collider
            .moveTo(this.collider.position.plus(this.velocity.times(elapsedTimeMillis)), false)
            .minus(colliderOffset)
        this.sprite.transform.depth =
            this.sprite.transform.position.y + this.sprite.transform.dimensions.y

        const afterPos = this.sprite.transform.position
        const timesUp = now() - this.throwTime > flightTime
        const stillMoving = !timesUp && beforePos.distanceTo(afterPos) >= 0.05

        if (stillMoving) {
            return
        }

        this.velocity = Point.ZERO
        this.collider.delete()
        this.sprite.transform.depth = GroundRenderer.DEPTH + 1000 // should be above all ground stuff but under all players
        this.enabled = false // no more updates! no more updates!

        // collided, short circuit
        const enemy = this.getEnemy(
            this.attacker,
            this.collider.position.plus(this.collider.dimensions),
            20
        )

        if (enemy) {
            this.velocity = Point.ZERO

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

            // MPTODO — This is a little janky, we should probably sync projectiles
            if (session.isHost()) {
                enemy.damage(1, {
                    direction: enemy.standingPosition.minus(this.attacker.standingPosition),
                    knockback: 30,
                    attacker: this.attacker,
                })
            }
        }
    }

    getEnemy(attacker: Dude, projectilePos: Point, attackDistance: number): Dude {
        const allEnemies = here()
            .getDudes()
            .filter((d) => d && d !== attacker && d.isEnemy(attacker))
            .filter((d) => d.standingPosition.distanceTo(projectilePos) < attackDistance)

        return Lists.minBy(allEnemies, (d) => d.standingPosition.manhattanDistanceTo(projectilePos))
    }
}

export const spawnThrownProjectile = (
    sprite: SpriteComponent,
    tip: Point,
    velocity: Point,
    attacker: Dude
) => {
    here().addProjectile(new Entity([new ThrownProjectile(sprite, tip, velocity, attacker)]))
}
