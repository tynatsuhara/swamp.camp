import { Point } from "brigsby/dist/Point"
import { TILE_SIZE } from "../../graphics/Tilesets"
import { LightManager } from "../../world/LightManager"
import { NPCSchedule, NPCScheduleType } from "./NPCSchedule"
import { NPCTask } from "./NPCTask"
import { NPCTaskContext } from "./NPCTaskContext"

export class NPCTaskScheduleRoam extends NPCTask {

    private readonly schedule: NPCSchedule

    constructor(schedule: NPCSchedule) {
        super()
        this.schedule = schedule
    }

    performTask(context: NPCTaskContext) {
        if (this.schedule.type === NPCScheduleType.ROAM) {
            context.roam(0.5)
        } else if (this.schedule.type === NPCScheduleType.ROAM_IN_DARKNESS) {
            context.roam(
                LightManager.instance.isDark(context.dude.standingPosition, context.dude.location) ? 0.5 : 1,
                {
                    ptSelectionFilter: (pt) => LightManager.instance.isDark(pt.times(TILE_SIZE), context.dude.location)
                }
            )
        } else {
            throw new Error("invalid state")
        }
    }
}