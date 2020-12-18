import { Component } from "../../engine/component"
import { Entity } from "../../engine/Entity"
import { saveManager } from "../SaveManager"

export class CutsceneManager {
    static instance: CutsceneManager

    private entity: Entity = null
    get isMidCutscene() { return !!this.entity }

    constructor() {
        CutsceneManager.instance = this
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
        saveManager.save()
    }

    getEntity(): Entity {
        return this.entity
    }
}