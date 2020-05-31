import { Component } from "../../engine/component"
import { Dude } from "./Dude"
import { UpdateData } from "../../engine/engine"

const enum Mode {
    BEGINNING_STAY_BY_TENT,
    FOLLOWING_PLAYER
}

type DipSave = {
    mode: Mode
}

export class DipController extends Component {

    private dude: Dude

    awake() {
        this.dude = this.entity.getComponent(Dude)
    }

    update(updateData: UpdateData) {

    }

    /**
     * Returns mutable save data
     */
    private saveData(): DipSave {
        return this.dude.blob as DipSave
    }

    static makeInitialState() {
        return { mode: Mode.BEGINNING_STAY_BY_TENT }
    }
}