import { BoxCollider } from "brigsby/dist/collision/BoxCollider"
import { CollisionEngine } from "brigsby/dist/collision/CollisionEngine"
import { Component } from "brigsby/dist/Component"
import { Entity } from "brigsby/dist/Entity"
import { Point } from "brigsby/dist/Point"

export class Barrier extends Component {
    // static PLAYER_ONLY = "player-only"

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
