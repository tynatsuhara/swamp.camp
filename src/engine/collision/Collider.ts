import { Component } from "../component"
import { StartData, UpdateData } from "../engine"
import { Point } from "../point"
import { RenderMethod } from "../renderer/RenderMethod"
import { LineRender } from "../renderer/LineRender"
import { debug } from "../debug"

class CollisionEngine {
    private colliders: Collider[] = []

    registerCollider(collider: Collider) {
        this.colliders.push(collider)
    }

    unregisterCollider(collider: Collider) {
        this.colliders.filter(c => c !== collider)
    }

    checkCollider(collider: Collider) {
        this.colliders.filter(other => other != collider && other.entity).forEach(other => {
            const isColliding = other.getPoints().some(pt => collider.isWithinBounds(pt))
            collider.updateColliding(other, isColliding)
            other.updateColliding(collider, isColliding)
        }) 
    }
}

const ENGINE = new CollisionEngine()

/**
 * 
 */
export abstract class Collider extends Component {

    private _position: Point  // top-left
    get position() { return this._position }
    
    readonly collidingWith: Set<Collider> = new Set()
    private onColliderEnterCallback: (collider: Collider) => void = () => {}

    constructor(position: Point) {
        super()
        this._position = position
        ENGINE.registerCollider(this)
    }

    start(startData: StartData) {
        ENGINE.checkCollider(this)
    }
    
    update(updateData: UpdateData) {}

    moveTo(point: Point): Point {
        // TODO revisit this to account for objects in the way
        this._position = point
        ENGINE.checkCollider(this)  // since this is all syncronous, it will work
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
     * Returns the points which form the shape of the collider.
     * If any of these points are contained within another collider,
     * they are considered to be colliding.
     */
    abstract getPoints(): Point[]
    
    /**
     * Returns true if pt is located within the collider.
     */
    abstract isWithinBounds(pt: Point): boolean

    /**
     * Returns the first point where a line from start->end intersects with this collider.
     * Returns null if there is no intersection.
     */
    abstract lineIntersection(start: Point, end: Point): Point
}
