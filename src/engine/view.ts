import { Entity } from "./entity"
import { Point } from "./point";

export class View {
    readonly zoom: number
    readonly offset: Point
    readonly entities: Entity[]
}