import { Component } from "brigsby/dist/Component"
import { Entity } from "brigsby/dist/Entity"
import { AbstractType } from "brigsby/dist/Types"
import { Singletons } from "../Singletons"

export class CutsceneManager {
    static get instance() {
        return Singletons.getOrCreate(CutsceneManager)
    }

    private entity: Entity = null
    get isMidCutscene() {
        return !!this.entity
    }

    /**
     * TODO: Handle the case where a cutscene starts, overlapping (this might not matter if we are careful with how we use them)
     * TODO: Handle saving during a cutscene. Most likely we should just block saving until after.
     */
    startCutscene(cutsceneComponent: Component) {
        this.entity = new Entity([cutsceneComponent])
    }

    finishCutscene() {
        this.entity = null
    }

    getEntity(): Entity {
        return this.entity
    }

    isCutsceneActive<T extends Component>(type: AbstractType<T>) {
        return !!this.entity?.getComponent(type)
    }
}
