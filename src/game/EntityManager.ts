import { Entity } from "../engine/Entity"

export class EntityManager {

    static instance: EntityManager
    private set = new Set<Entity>()

    constructor() {
        EntityManager.instance = this
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