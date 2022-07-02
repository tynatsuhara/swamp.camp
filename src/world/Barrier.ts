import { Component, Entity, Point } from "brigsby/dist"
import { BoxCollider, CollisionEngine } from "brigsby/dist/collision"

export class Barrier extends Component {
    private readonly position: Point
    private readonly dimensions: Point
    private readonly allow: String[]

    constructor(position: Point, dimensions: Point, allow: String[] = []) {
        super()
        this.position = position
        this.dimensions = dimensions
        this.allow = allow
    }

    awake() {
        this.entity.addComponent(
            new BoxCollider(this.position, this.dimensions, CollisionEngine.DEFAULT_LAYER)
        )
    }

    static fromJson(obj: object): Entity {
        return new Entity([
            new Barrier(Point.fromString(obj["p"]), Point.fromString(obj["d"]), obj["a"]),
        ])
    }

    toJson() {
        return {
            p: this.position.toString(),
            d: this.dimensions.toString(),
            a: this.allow,
        }
    }
}
