import { NPCSchedule, NPCScheduleType } from "./NPCSchedule"
import { NPCTask } from "./NPCTask"
import { NPCTaskFollowLeader } from "./NPCTaskFollowLeader"
import { NPCTaskScheduleDefaultVillager } from "./NPCTaskScheduleDefaultVillager"
import { NPCTaskScheduleGoToLocation } from "./NPCTaskScheduleGoToLocation"
import { NPCTaskScheduleGoToSpot } from "./NPCTaskScheduleGoToSpot"
import { NPCTaskScheduleRoam } from "./NPCTaskScheduleRoam"

export class NPCTaskFactory {
    static fromSchedule(schedule: NPCSchedule): NPCTask {
        switch (schedule.type) {
            case NPCScheduleType.DO_NOTHING:
                return null
            case NPCScheduleType.GO_TO_SPOT:
                return new NPCTaskScheduleGoToSpot(schedule)
            case NPCScheduleType.ROAM:
                return new NPCTaskScheduleRoam()
            case NPCScheduleType.DEFAULT_VILLAGER:
                return new NPCTaskScheduleDefaultVillager()
            case NPCScheduleType.GO_TO_LOCATION:
                return new NPCTaskScheduleGoToLocation(schedule)
            case NPCScheduleType.FOLLOW_LEADER:
                return new NPCTaskFollowLeader()
            default:
                console.log(`invalid schedule: ${JSON.stringify(schedule)}`)
                return null
        }
    }
}
