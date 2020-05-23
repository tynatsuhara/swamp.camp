import { Component } from "../../engine/component"
import { Entity } from "../../engine/Entity"

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

    getEntities(): Entity[] {
        return !!this.entity ? [this.entity] : []
    }
}