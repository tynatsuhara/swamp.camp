import { Component } from "../../engine/Component"
import { Entity } from "../../engine/Entity"
import { saveManager } from "../SaveManager"
import { Singletons } from "../Singletons"

export class CutsceneManager {

    static get instance() {
        return Singletons.getOrCreate(CutsceneManager)
    }

    private entity: Entity = null
    get isMidCutscene() { return !!this.entity }

    /**
     * TODO: Handle the case where a cutscene starts, overlapping (this might not matter if we are careful with how we use them)
     * TODO: Handle saving during a cutscene. Most likely we should just block saving until after.
     */
    startCutscene(cutsceneComponent: Component) {
        this.entity = new Entity([cutsceneComponent])
    }

    finishCutscene() {
        this.entity = null
        saveManager.save()
    }

    getEntity(): Entity {
        return this.entity
    }
}