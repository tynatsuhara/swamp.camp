import { Component } from "brigsby/dist/Component"
import { WorldTime } from "../WorldTime"

export class Growable extends Component {
    private nextGrowthTime: number
    private growFn: () => void

    constructor(nextGrowthTime: number, growFn: () => void) {
        super()
        this.nextGrowthTime = nextGrowthTime
        this.growFn = growFn
    }

    lateUpdate() {
        if (WorldTime.instance.time >= this.nextGrowthTime) {
            this.growFn()
            this.delete()
        }
    }
}
