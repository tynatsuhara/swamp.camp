import { Point } from "../../engine/point"

export const enum NPCScheduleType {
    DO_NOTHING,
    GO_TO_SPOT,  // fields: p (stringified Point)
}

export type NPCSchedule = {
    type: NPCScheduleType
    [others: string]: any;
}

export const NPCSchedules = {
    SCHEDULE_KEY: "sch",

    newNoOpSchedule: (): NPCSchedule => { return { type: NPCScheduleType.DO_NOTHING } },

    newGoToSchedule: (pt: Point): NPCSchedule => { return { type: NPCScheduleType.GO_TO_SPOT, p: pt.toString() } },
}