import { Point } from "brigsby/dist"
import { TimeUnit } from "../../world/TimeUnit"

export enum NPCScheduleType {
    DO_NOTHING,
    GO_TO_SPOT, // fields: p (stringified tile Point)
    ROAM,
    DEFAULT_VILLAGER,
    GO_TO_LOCATION,
    FOLLOW_LEADER,
}

export type NPCSchedule = {
    type: NPCScheduleType
    [others: string]: any
}

/**
 * Creates simple schedule objects which can be directly serialized
 * This will be translated into an NPCTask in {@link NPCTaskFactory}
 */
export const NPCSchedules = {
    SCHEDULE_KEY: "sch",

    // stand where you are and do nothing
    newNoOpSchedule: () => ({ type: NPCScheduleType.DO_NOTHING }),

    // go to a specific spot and hang out there
    newGoToSchedule: (tilePoint: Point) => ({
        type: NPCScheduleType.GO_TO_SPOT,
        p: tilePoint.toString(),
    }),

    // just walk around aimlessly
    newFreeRoamSchedule: () => ({ type: NPCScheduleType.ROAM }),

    // go home at night and roam around during the day
    newDefaultVillagerSchedule: () => ({
        type: NPCScheduleType.DEFAULT_VILLAGER,
    }),

    // hang out in a specific location, either roaming or at a specific position
    newGoToLocationSchedule: (locationUUID: string, tilePoint?: Point) => ({
        type: NPCScheduleType.GO_TO_LOCATION,
        l: locationUUID,
        p: tilePoint?.toString(),
    }),

    newFollowLeaderSchedule: () => ({
        type: NPCScheduleType.FOLLOW_LEADER,
    }),

    VILLAGER_WAKE_UP_TIME: TimeUnit.HOUR * 6,
    VILLAGER_STOP_WORK_TIME: TimeUnit.HOUR * 18,
    VILLAGER_GO_HOME_TIME: TimeUnit.HOUR * 21,
}
