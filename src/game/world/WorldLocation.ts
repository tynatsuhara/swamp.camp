import { Grid } from "../../engine/util/Grid"
import { Entity } from "../../engine/Entity"

export class WorldLocation {

    // Non-moving entities with tile coords (not pixel coords)
    // Entities may be duplicated in multiple spots 
    // (entities spawning multiple tiles eg a tent)
    // BUT an entity should only be in one of these data structures
    readonly ground = new Grid<Entity>()
    readonly stuff = new Grid<Entity>()

    // Entities with a dynamic position
    readonly dynamic = new Set<Entity>()

    getEntities() {
        return Array.from(new Set(this.ground.entries()))
                .concat(Array.from(new Set(this.stuff.entries())))
                .concat(Array.from(this.dynamic))
    }
}