import { Entity } from "./entity"
import { Point } from "./point";

export class View {
    zoom: number = 0
    offset: Point = new Point(0, 0)
    entities: Entity[] = []
}