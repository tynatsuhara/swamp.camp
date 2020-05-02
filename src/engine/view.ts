import { Entity } from "./Entity"
import { Point } from "./point"

export class View {
    entities: Entity[] = []          // entities ordered by depth (back to front)
    zoom: number = 1                 // scale of the view
    offset: Point = new Point(0, 0)  // transform applied to all entities in the view (scaled by zoom)

    constructor(
        entities: Entity[] = [], 
        zoom: number = 1, 
        offset: Point = new Point(0, 0),
    ) {
        this.entities = entities
        this.zoom = zoom
        this.offset = offset
    }
}