import { Collider } from "./Collider"
import { RenderMethod } from "../renderer/RenderMethod"
import { debug } from "../debug"
import { LineRender } from "../renderer/LineRender"
import { Point } from "../point"
import { rectContains } from "../util/utils"
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