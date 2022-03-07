import { QueuedEventData } from "../world/events/QueuedEvent"
import { TaxRate } from "../world/TaxRate"
import { LocationManagerSaveState } from "./LocationManagerSaveState"

export class Save {
    version: number
    timeSaved: number
    saveVersion: number
    locations: LocationManagerSaveState
    worldTime: number
    eventQueue: QueuedEventData[]
    state: SaveState
}

/**
 * This is for data that is written by game components
 */
export class SaveState {
    coins?: number = 0
    plumeIndex?: number = 0
    townStats?: { [key: string]: number }
    timePlayed?: number = 0
    taxRate?: TaxRate = TaxRate.NONE

    // miscellaneous flags and values for game progress milestones
    hasRecruitedAnyVillagers?: boolean = false
}
