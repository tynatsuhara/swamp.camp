import { Component } from "brigsby/dist"
import { session } from "../../online/session"
import { now } from "../WorldTime"

export class Growable extends Component {
    constructor(private nextGrowthTime: number, private readonly growFn: () => number | void) {
        super()
    }

    lateUpdate() {
        if (session.isGuest()) {
            return
        }

        if (now() >= this.nextGrowthTime) {
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
