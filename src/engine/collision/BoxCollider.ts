import { Point } from "../Point"
import { rectContains } from "../util/Utils"
import { Collider } from "./Collider"
import { CollisionEngine } from "./CollisionEngine"

export class BoxCollider extends Collider {

    readonly dimensions: Point

    constructor(position: Point, dimensions: Point, layer: string = CollisionEngine.DEFAULT_LAYER, ignoredColliders: Collider[] = []) {
        super(position, layer, ignoredColliders)
        this.dimensions = dimensions
    }

    getPoints(): Point[] {
        return [
            new Point(this.position.x, this.position.y),
            new Point(this.position.x + this.dimensions.x, this.position.y),
            new Point(this.position.x + this.dimensions.x, this.position.y + this.dimensions.y),
            new Point(this.position.x, this.position.y + this.dimensions.y)
        ]
    }

    isWithinBounds(pt: Point): boolean {
        return rectContains(this.position, this.dimensions, pt)
    }
}