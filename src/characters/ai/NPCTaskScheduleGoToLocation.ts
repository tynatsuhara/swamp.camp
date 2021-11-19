import { Point } from "brigsby/dist/Point"
import { LocationManager } from "../../world/LocationManager"
import { WorldLocation } from "../../world/WorldLocation"
import { NPCSchedule } from "./NPCSchedule"
import { NPCTask } from "./NPCTask"
import { NPCTaskContext } from "./NPCTaskContext"

export class NPCTaskScheduleGoToLocation extends NPCTask {
    private readonly location: WorldLocation
    private readonly pt: Point

    constructor(schedule: NPCSchedule) {
        super()
        this.location = LocationManager.instance.get(schedule.l)
        if (schedule.p) {
            this.pt = Point.fromString(schedule.p)
        }
    }

    performTask(context: NPCTaskContext) {
        if (context.dude.location != this.location) {
            context.goToLocation(this.location)
        } else if (this.pt) {
            context.walkTo(this.pt)
        } else {
            // we don't have a specific standing position, so just roam around
            context.roam(0.5, {
                pauseEveryMillis: 2500 + 2500 * Math.random(),
                pauseForMillis: 2500 + 5000 * Math.random(),
            })
        }
    }
}
