import { Entity } from "../engine/Entity"

/**
 * Used for tracking things that do not align to the x/y grid
 */
export class DynamicEntityManager {

    static instance: DynamicEntityManager
    private set = new Set<Entity>()

    constructor() {
        DynamicEntityManager.instance = this
    }

    add(e: Entity) {
        this.set.add(e)
    }

    delete(e: Entity) {
        e.selfDestruct()
        this.set.delete(e)
    }

    getEntities(): Entity[] {
        return Array.from(this.set)
    }
}