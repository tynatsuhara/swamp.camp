import { Point } from "../point"
import { rectContains } from "../util/utils"
import { Collider } from "./Collider"

export class CollisionEngine {

    static instance: CollisionEngine = new CollisionEngine()

    private colliders: Collider[] = []
    private nextUpdateColliders: Collider[] = []

    constructor() {
        CollisionEngine.instance = this
    }

    /**
     * A collider must mark itself in order to be included in any collision calculations in the next update step.
     * This allows us to keep track of any colliders that are "active"
     */
    markCollider(collider: Collider) {
        this.nextUpdateColliders.push(collider)
    }

    nextUpdate() {
        this.colliders = this.nextUpdateColliders
        this.nextUpdateColliders = []
    }

    // Needs further testing. No active use case right now.
    tryMove(collider: Collider, to: Point): Point {
        const translation = to.minus(collider.position)
        const pts = collider.getPoints()

        // find all colliders within a bounding box
        const xMin = Math.min(...pts.map(pt => pt.x + Math.min(translation.x, 0)))
        const xMax = Math.max(...pts.map(pt => pt.x + Math.max(translation.x, 0)))
        const yMin = Math.min(...pts.map(pt => pt.y + Math.min(translation.y, 0)))
        const yMax = Math.max(...pts.map(pt => pt.y + Math.max(translation.y, 0)))
        const potentialCollisions = this.colliders.filter(other => other !== collider && other.getPoints().some(pt => {
            return rectContains(new Point(xMax, yMin), new Point(xMax-xMin, yMax-yMin), pt)
        })) 
        
        // for all pts and all those colliders, find the closest intersection
        const collisions = pts.flatMap(pt => potentialCollisions
                .map(other => other.lineCast(pt, pt.plus(translation)))
                .filter(intersect => !!intersect)
                .map(intersect => intersect.minus(collider.position))  // the distance `pt` can move before it collides with `other`
        )

        if (collisions.length > 0) { 
            const dist = collisions.reduce((l, r) => l.magnitude() < r.magnitude() ? l : r)
            return collider.position.plus(dist)
        } else {
            return to
        }
    }

    checkCollider(collider: Collider) {
        this.removeDanglingColliders()
        this.colliders.filter(other => other !== collider && other.enabled && other.isTrigger).forEach(other => {
            const isColliding = other.getPoints().some(pt => collider.isWithinBounds(pt)) 
                    || collider.getPoints().some(pt => other.isWithinBounds(pt))
            collider.updateColliding(other, isColliding)
            other.updateColliding(collider, isColliding)
        }) 
    }

    // Returns true if the collider can be translated and will not intersect a non-trigger collider in the new position.
    // This DOES NOT check for any possible colliders in the path of the collision and should only be used for small translations.
    canTranslate(collider: Collider, translation: Point): boolean {
        if (collider.isTrigger) {  // nothing will ever block this collider
            return true
        }
        this.removeDanglingColliders()
        const translatedPoints = collider.getPoints().map(pt => pt.plus(translation))
        return !this.colliders.filter(other => other !== collider && other.enabled && !other.isTrigger).some(other => {
            return translatedPoints.some(pt => other.isWithinBounds(pt))  // TODO 
                    || collider.checkWithinBoundsAfterTranslation(translation, other)
        }) 
    }

    // unregisters any colliders without an entity
    private removeDanglingColliders() {
        this.colliders = this.colliders.filter(other => !!other.entity)
    }
}