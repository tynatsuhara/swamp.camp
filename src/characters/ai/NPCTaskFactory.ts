import { NPCTaskScheduleGoToSpot } from "./NPCTaskScheduleGoToSpot"
import { NPCSchedule, NPCScheduleType } from "./NPCSchedule"
import { NPCTask } from "./NPCTask"
import { NPCTaskScheduleRoam } from "./NPCTaskScheduleRoam"
import { NPCTaskScheduleDefaultVillager } from "./NPCTaskScheduleDefaultVillager"
import { NPCTaskScheduleGoToLocation } from "./NPCTaskScheduleGoToLocation"

export class NPCTaskFactory {

    static fromSchedule(schedule: NPCSchedule): NPCTask {
        switch (schedule.type) {
            case NPCScheduleType.DO_NOTHING:
                return null
            case NPCScheduleType.GO_TO_SPOT:
                return new NPCTaskScheduleGoToSpot(schedule)
            case NPCScheduleType.ROAM:
                return new NPCTaskScheduleRoam(schedule)
            case NPCScheduleType.DEFAULT_VILLAGER:
                return new NPCTaskScheduleDefaultVillager(schedule)
            case NPCScheduleType.GO_TO_LOCATION:
                return new NPCTaskScheduleGoToLocation(schedule)
            default:
                throw new Error(`invalid schedule: ${JSON.stringify(schedule)}`)
        }
    }
}