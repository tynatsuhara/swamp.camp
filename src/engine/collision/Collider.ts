import { Component } from "../component"
import { StartData, UpdateData } from "../engine"
import { Point } from "../point"
import { RenderMethod } from "../renderer/RenderMethod"
import { LineRender } from "../renderer/LineRender"
import { debug } from "../debug"
import { rectContains } from "../util/utils"

class CollisionEngine {
    private colliders: Collider[] = []

    registerCollider(collider: Collider) {
        this.colliders.push(collider)
    }

    unregisterCollider(collider: Collider) {
        this.colliders.filter(c => c !== collider)
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
        this.colliders.filter(other => other !== collider && other.entity && other.enabled && other.isTrigger).forEach(other => {
            const isColliding = other.getPoints().some(pt => collider.isWithinBounds(pt))
            collider.updateColliding(other, isColliding)
            other.updateColliding(collider, isColliding)
        }) 
    }

    // Returns true if the collider can be translated and will not intersect a non-trigger collider in the new position.
    // This DOES NOT check for any possible colliders in the path of the collision and should only be used for small translations.
    canTranslate(collider, translation: Point): boolean {
        if (collider.isTrigger) {  // nothing will ever block this collider
            return true
        }
        const translatedPoints = collider.getPoints().map(pt => pt.plus(translation))
        return !this.colliders.filter(other => other !== collider && other.entity && other.enabled && !other.isTrigger).some(other => {
            return translatedPoints.some(pt => other.isWithinBounds(pt))
        }) 
    }
}

const ENGINE = new CollisionEngine()

/**
 * A collider detects intersections with other colliders. If isTrigger=true, a collider
 * just calls the callback functions and does not block the other collider. If isTrigger=false,
 * other colliders will not be able to move in to this collider's space, and callbacks won't be triggered.
 */
export abstract class Collider extends Component {

    private _position: Point  // top-left
    get position() { return this._position }
    isTrigger: boolean
    
    readonly collidingWith: Set<Collider> = new Set()
    private onColliderEnterCallback: (collider: Collider) => void = () => {}

    constructor(position: Point, isTrigger: boolean) {
        super()
        this._position = position
        this.isTrigger = isTrigger
        ENGINE.registerCollider(this)
    }

    start(startData: StartData) {
        ENGINE.checkCollider(this)
    }
    
    update(updateData: UpdateData) {}

    moveTo(point: Point): Point {
        const dx = point.x - this.position.x
        const dy = point.y - this.position.y
        // TODO: Should these branches be handled by the caller?
        if (ENGINE.canTranslate(this, new Point(dx, dy))) {
            this._position = point
            ENGINE.checkCollider(this)
        } else if (ENGINE.canTranslate(this, new Point(dx, 0))) {
            this._position = this._position.plus(new Point(dx, 0))
            ENGINE.checkCollider(this)
        } else if (ENGINE.canTranslate(this, new Point(0, dy))) {
            this._position = this._position.plus(new Point(0, dy))
            ENGINE.checkCollider(this)
        }
        return this.position
    }

    updateColliding(other: Collider, isColliding: boolean) {
        if (isColliding && !this.collidingWith.has(other)) {
            this.onColliderEnterCallback(other)
            this.collidingWith.add(other)
        } else if (!isColliding && this.collidingWith.has(other)) {
            // TODO call onExit
            this.collidingWith.delete(other)
        }
    }

    onColliderEnter(callback: (collider: Collider) => void) {
        this.onColliderEnterCallback = callback
    }

    getRenderMethods(): RenderMethod[] {
        if (!debug.showColliders) {
            return []
        }
        
        const color = this.collidingWith.size > 0 ? "#00ff00" : "#ff0000"
        const pts = this.getPoints()
        const lines = []
        let lastPt = pts[pts.length-1]
        for (const pt of pts) {
            lines.push(new LineRender(pt, lastPt, color))
            lastPt = pt
        }

        return lines
    }

    /**
     * Returns the first point where a line from start->end intersects with this collider.
     * Returns null if there is no intersection.
     */
    lineCast(start: Point, end: Point): Point {
        let result = null
        let resultDist = 0

        const pts = this.getPoints()
        let lastPt = pts[pts.length-1]

        for (const pt of pts) {
            const intersect = this.lineIntersect(pt, lastPt, start, end)
            if (!!intersect) {
                const dist = intersect.distanceTo(start)
                if (result == null || dist < resultDist) {
                    result = intersect
                    resultDist = dist
                }
            }
        }

        return result
    }

    private lineIntersect(line1Start, line1End, line2Start, line2End): Point {
        // https://en.wikipedia.org/wiki/Line%E2%80%93line_intersection#Given_two_points_on_each_line
        const x1 = line1Start.x
        const y1 = line1Start.y
        const x2 = line1End.x
        const y2 = line1End.y
        const x3 = line2Start.x
        const y3 = line2Start.y
        const x4 = line2End.x
        const y4 = line2End.y

        // lines with the same slope don't intersect
        if (((x1-x2) * (y3-y4) - (y1-y2) * (x3-x4)) == 0) {
            return null
        }

        const tNumerator = (x1-x3) * (y3-y4) - (y1-y3) * (x3-x4)
        const uNumerator = -((x1-x2) * (y1-y3) - (y1-y2) * (x1-x3))
        const denominator = (x1-x2) * (y3-y4) - (y1-y2) * (x3-x4)

        if (tNumerator >= 0 && tNumerator <= denominator && uNumerator >= 0 && uNumerator <= denominator) {
            const t = tNumerator/denominator
            return new Point(x1 + t * (x2-x1), y1 + t * (y2-y1))
        }

        return null
    }
    
    /**
     * Returns the points which form the shape of the collider.
     * If any of these points are contained within another collider,
     * they are considered to be colliding.
     */
    abstract getPoints(): Point[]
    
    /**
     * Returns true if pt is located within the collider.
     */
    abstract isWithinBounds(pt: Point): boolean
}
