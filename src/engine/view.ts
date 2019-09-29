import { Entity } from "./entity"
import { Point } from "./point";

export class View {
    zoom: number = 0  // scale of the view
    offset: Point = new Point(0, 0)  // transform applied to all entities in the view (scaled by zoom)
    entities: Entity[] = []  // entities ordered by depth (back to front)
}