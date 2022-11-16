import { Component } from "brigsby/dist"
import { session } from "../../online/session"
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
        if (session.isGuest()) {
            return
        }

        if (WorldTime.instance.time >= this.nextGrowthTime) {
            this.forceGrow()
        }
    }

    forceGrow() {
        const nextGrowthTime = this.growFn()
        if (nextGrowthTime === undefined) {
            this.delete()
        } else {
            this.nextGrowthTime = nextGrowthTime as number
        }
    }
}
