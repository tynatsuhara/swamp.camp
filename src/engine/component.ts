import { UpdateData, StartData, AwakeData } from "./engine"
import { Entity } from "./Entity"
import { RenderMethod } from "./renderer/RenderMethod"

export abstract class Component {

    entity: Entity
    enabled: boolean = true

    /**
     * Called once, immediately after entity is defined and before start() is called.
     * It is safe to add additional components to the entity in this function.
     */
    awake(awakeData: AwakeData) {}
    
    /**
     * Called once, after the component is added to a valid entity and before update() is called
     */
    start(startData: StartData) {}

    /**
     * Called on each update step
     */
    update(updateData: UpdateData) {}

    /**
     * Should be overridden by renderable components
     */
    getRenderMethods(): RenderMethod[] {
        return []
    }

    /**
     * Override if custom logic is desired when a component or parent entity is deleted
     */
    delete() {
        this.entity?.removeComponent(this)
    }
}
