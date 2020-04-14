import { Component } from "./component";
import { StartData, UpdateData } from "./engine";
import { Point } from "./point";
import { RenderMethod } from "./renderer/renderer";
import { LineRender } from "./renderer/LineRender";
import { debug } from "./debug";

class CollisionEngine {
    private colliders: BoxCollider[] = []

    registerCollider(collider: BoxCollider) {
        this.colliders.push(collider)
    }

    unregisterCollider(collider: BoxCollider) {
        this.colliders.filter(c => c !== collider)
    }

    checkCollider(collider: BoxCollider) {
        this.colliders.filter(other => other != collider && other.entity).forEach(other => {
            const isColliding = !(collider.position.x + collider.dimensions.x < other.position.x         // to the left of other
                || collider.position.x > other.position.x + other.dimensions.x       // to the right of other
                || collider.position.y + collider.dimensions.y < other.position.y  // above other
                || collider.position.y > other.position.y + other.dimensions.y       // below other
            );
            collider.updateColliding(other, isColliding)
            other.updateColliding(collider, isColliding)
        }) 
    }
}

const ENGINE = new CollisionEngine()

export class BoxCollider extends Component {

    private _position: Point  // top-left
    get position() { return this._position }
    
    private collidingWith: Set<BoxCollider> = new Set()
    private onColliderEnterCallback: (collider: BoxCollider) => void = () => {}

    readonly dimensions: Point  

    constructor(position: Point, dimensions: Point) {
        super()
        this._position = position
        this.dimensions = dimensions
        ENGINE.registerCollider(this)
    }

    start(startData: StartData) {
        ENGINE.checkCollider(this)
    }
    
    update(updateData: UpdateData) {}

    moveTo(point: Point): Point {
        this._position = point
        ENGINE.checkCollider(this)  // since this is all syncronous, it will work
        return this.position
    }

    getRenderMethods(): RenderMethod[] {
        if (!debug.showColliders) {
            return []
        }
        const color = this.collidingWith.size > 0 ? "#00ff00" : "#ff0000"
        return [
            new LineRender(this.position, this.position.plus(new Point(this.dimensions.x, 0)), color),
            new LineRender(this.position, this.position.plus(new Point(0, this.dimensions.y)), color),
            new LineRender(this.position.plus(this.dimensions), this.position.plus(new Point(this.dimensions.x, 0)), color),
            new LineRender(this.position.plus(this.dimensions), this.position.plus(new Point(0, this.dimensions.y)), color),
        ]
    }

    updateColliding(other: BoxCollider, isColliding: boolean) {
        if (isColliding && !this.collidingWith.has(other)) {
            this.onColliderEnterCallback(other)
            this.collidingWith.add(other)
        } else if (!isColliding && this.collidingWith.has(other)) {
            // TODO call onExit
            this.collidingWith.delete(other)
        }
    }

    onColliderEnter(callback: (collider: BoxCollider) => void) {
        this.onColliderEnterCallback = callback
    }
}
