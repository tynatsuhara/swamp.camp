import { Point } from "brigsby/dist/Point"
import { NPCSchedule } from "./NPCSchedule"
import { NPCTask } from "./NPCTask"
import { NPCTaskContext } from "./NPCTaskContext"

export class NPCTaskScheduleGoToSpot extends NPCTask {

    private readonly pt: Point

    constructor(schedule: NPCSchedule) {
        super()
        this.pt = Point.fromString(schedule["p"])
    }

    performTask(context: NPCTaskContext) {
        context.walkTo(this.pt)
    }
}