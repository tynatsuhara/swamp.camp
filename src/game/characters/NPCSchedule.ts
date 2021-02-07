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

    newNoOpSchedule: () => ({ type: NPCScheduleType.DO_NOTHING }),

    newGoToSchedule: (tilePoint: Point) => ({ type: NPCScheduleType.GO_TO_SPOT, p: tilePoint.toString() }),

    newFreeRoamInDarkSchedule: () => ({ type: NPCScheduleType.ROAM_IN_DARKNESS }),

    newFreeRoamSchedule: (
        // TODO: new params
        pauseFrequencyMin: number = 0, 
        pauseFrequencyMax: number = 0, 
        pauseDurationMin: number = 0,
        pauseDurationMax: number = 0,
    ) => ({ 
        type: NPCScheduleType.ROAM,
        fl: pauseFrequencyMin,
        fh: pauseFrequencyMax,
        dl: pauseDurationMin,
        dh: pauseDurationMax,
    }),

    newDefaultVillagerSchedule: () => ({ type: NPCScheduleType.DEFAULT_VILLAGER })
}
