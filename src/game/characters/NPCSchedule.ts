import { Point } from "../../engine/Point"

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

    newNoOpSchedule: () => ({ type: NPCScheduleType.DO_NOTHING }),

    newGoToSchedule: (tilePoint: Point) => ({ type: NPCScheduleType.GO_TO_SPOT, p: tilePoint.toString() }),

    newFreeRoamInDarkSchedule: () => ({ type: NPCScheduleType.ROAM_IN_DARKNESS }),

    newFreeRoamSchedule: () => ({ type: NPCScheduleType.ROAM }),

    newDefaultVillagerSchedule: () => ({ type: NPCScheduleType.DEFAULT_VILLAGER })
}
