import { Component } from "brigsby/dist"
import { WorldTime } from "../WorldTime"

export class Growable extends Component {
    private nextGrowthTime: number
    private growFn: () => number | void

    constructor(nextGrowthTime: number, growFn: () => number | void) {
        super()
        this.nextGrowthTime = nextGrowthTime
        this.growFn = growFn
    }

    lateUpdate() {
        if (WorldTime.instance.time >= this.nextGrowthTime) {
            const nextGrowthTime = this.growFn()
            if (nextGrowthTime === undefined) {
                this.delete()
            } else {
                this.nextGrowthTime = nextGrowthTime as number
            }
        }
    }
}
