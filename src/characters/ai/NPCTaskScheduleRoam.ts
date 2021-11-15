import { Point } from "brigsby/dist/Point"
import { TILE_SIZE } from "../../graphics/Tilesets"
import { LightManager } from "../../world/LightManager"
import { DudeFaction, DudeType } from "../DudeFactory"
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
        if (context.dude.factions.includes(DudeFaction.DEMONS)) {
            context.roam(
                LightManager.instance.isDark(context.dude.standingPosition, context.dude.location) ? 0.5 : 1,
                {
                    ptSelectionFilter: (pt) => LightManager.instance.isDark(pt.times(TILE_SIZE), context.dude.location)
                }
            )
        } else {
            context.roam(0.5)
        }
    }
}