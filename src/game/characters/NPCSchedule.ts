import { Point } from "../../engine/Point"
import { TimeUnit } from "../world/TimeUnit"
import { WorldTime } from "../world/WorldTime"

export const enum NPCScheduleType {
    DO_NOTHING,
    GO_TO_SPOT,  // fields: p (stringified tile Point)
    ROAM_IN_DARKNESS,
    ROAM,
    DEFAULT_VILLAGER
}

export type NPCSchedule = {
    type: NPCScheduleType
    [others: string]: any;
}

export const NPCSchedules = {
    SCHEDULE_KEY: "sch",

    // stand where you are and do nothing
    newNoOpSchedule: () => ({ type: NPCScheduleType.DO_NOTHING }),

    // go to a specific spot and hang out there
    newGoToSchedule: (tilePoint: Point) => ({ type: NPCScheduleType.GO_TO_SPOT, p: tilePoint.toString() }),

    // roam around, avoiding light (demons)
    newFreeRoamInDarkSchedule: () => ({ type: NPCScheduleType.ROAM_IN_DARKNESS }),

    // just walk around aimlessly
    newFreeRoamSchedule: () => ({ type: NPCScheduleType.ROAM }),

    // go home at night and roam around during the day
    newDefaultVillagerSchedule: () => ({ type: NPCScheduleType.DEFAULT_VILLAGER }),

    VILLAGER_WAKE_UP_TIME: TimeUnit.HOUR * 8,
    VILLAGER_GO_HOME_TIME: TimeUnit.HOUR * 18,
}
