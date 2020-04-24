import { Component } from "./component"

/**
 * An object which exists in the game world and updated by the engine. Should be attached to a game view.
 */
export class Entity {
    components: Component[] = []

    // TODO: support hierarchical components?

    constructor(components: Component[] = []) {
        components.forEach(c => this.addComponent(c))
    }

    addComponent<T extends Component>(component: T): T {
        component.entity = this
        this.components.push(component)
        return component
    }

    getComponent<T extends Component>(componentType: { new(...args: any[]): T }): T {
        return this.getComponents(componentType)[0]
    }

    getComponents<T extends Component>(componentType: { new(...args: any[]): T }): T[] {
        return this.components.filter(c => c instanceof componentType).map(c => c as T)
    }

    removeComponent(component: Component) {
        this.components = this.components.filter(c => c !== component)
        component.entity = null
    }

    /**
     * Disables and removes all components. 
     * Passing a self-destructed entity to the engine will have no effects.
     */
    selfDestruct() {
        this.components.forEach(c => {
            c.entity = null
            c.enabled = false
        })
    }
}
