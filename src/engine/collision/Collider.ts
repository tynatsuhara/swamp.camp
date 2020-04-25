import { Component } from "../component"
import { StartData, UpdateData } from "../engine"
import { Point } from "../point"
import { RenderMethod } from "../renderer/RenderMethod"
import { LineRender } from "../renderer/LineRender"
import { debug } from "../debug"
import { CollisionEngine } from "./CollisionEngine"

/**
 * A collider detects intersections with other colliders. If isTrigger=true, a collider
 * just calls the callback functions and does not block the other collider. If isTrigger=false,
 * other colliders will not be able to move in to this collider's space, and callbacks won't be triggered.
 */
export abstract class Collider extends Component {

    private _position: Point  // top-left
    get position() { return this._position }
    isTrigger: boolean
    readonly layer: string
    
    readonly collidingWith: Set<Collider> = new Set()
    private onColliderEnterCallback: (collider: Collider) => void = () => {}

    /**
     * @param position top left position
     * @param isTrigger won't be checked for blocking collisions, only used for callbacks 
     * @param layer determines which colliders collide based on the collision matrix
     */
    constructor(position: Point, isTrigger: boolean, layer = CollisionEngine.DEFAULT_LAYER) {
        super()
        this._position = position
        this.isTrigger = isTrigger
        this.layer = layer
        CollisionEngine.instance.markCollider(this)
    }

    start(startData: StartData) {
        CollisionEngine.instance.checkCollider(this)
    }
    
    update(updateData: UpdateData) {
        CollisionEngine.instance.markCollider(this)
    }

    moveTo(point: Point): Point {
        const dx = point.x - this.position.x
        const dy = point.y - this.position.y
        // TODO: Should these branches be handled by the caller?
        if (CollisionEngine.instance.canTranslate(this, new Point(dx, dy))) {
            this._position = point
            CollisionEngine.instance.checkCollider(this)
        } else if (CollisionEngine.instance.canTranslate(this, new Point(dx, 0))) {
            this._position = this._position.plus(new Point(dx, 0))
            CollisionEngine.instance.checkCollider(this)
        } else if (CollisionEngine.instance.canTranslate(this, new Point(0, dy))) {
            this._position = this._position.plus(new Point(0, dy))
            CollisionEngine.instance.checkCollider(this)
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

    onColliderEnter(callback: (collider: Collider) => void): Collider {
        this.onColliderEnterCallback = callback
        return this
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

    checkWithinBoundsAfterTranslation(translation: Point, other: Collider) {
        this._position = this._position.plus(translation)
        const result = other.getPoints().some(p => this.isWithinBounds(p))
        this._position = this._position.minus(translation)
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
