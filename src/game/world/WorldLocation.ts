import { Grid } from "../../engine/util/Grid"
import { Entity } from "../../engine/Entity"

export class WorldLocation {

    // Non-moving entities with tile coords (not pixel coords)
    readonly ground = new Grid<Entity>()
    readonly stuff = new Grid<Entity>()

    // Entities with a dynamic position
    readonly dynamic = new Set<Entity>()

    getEntities() {
        return this.ground.entries()
                .concat(this.stuff.entries())
                .concat(Array.from(this.dynamic))
    }
}