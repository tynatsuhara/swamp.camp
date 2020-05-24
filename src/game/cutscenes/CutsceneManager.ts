import { Component } from "../../engine/component"
import { Entity } from "../../engine/Entity"
import { SaveManager } from "../SaveManager"

export class CutsceneManager {
    static instance: CutsceneManager

    private entity = new Entity()

    constructor() {
        CutsceneManager.instance = this
    }

    /**
     * TODO: Handle the case where a cutscene starts, overlapping (this might not matter if we are careful with how we use them)
     */
    startCutscene(cutsceneComponent: Component) {
        this.entity = new Entity([cutsceneComponent])
    }

    finishCutscene() {
        this.entity = null
        SaveManager.instance.save()
    }

    getEntities(): Entity[] {
        return !!this.entity ? [this.entity] : []
    }
}