import { Point } from "../../engine/point"

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

    newNoOpSchedule: (): NPCSchedule => ({ type: NPCScheduleType.DO_NOTHING }),

    newGoToSchedule: (tilePoint: Point): NPCSchedule => ({ type: NPCScheduleType.GO_TO_SPOT, p: tilePoint.toString() }),

    newFreeRoamInDarkSchedule: (): NPCSchedule => ({ type: NPCScheduleType.ROAM_IN_DARKNESS }),

    newFreeRoamSchedule: (): NPCSchedule => ({ type: NPCScheduleType.ROAM }),

    newDefaultVillagerSchedule: (): NPCSchedule => ({ type: NPCScheduleType.DEFAULT_VILLAGER })
}