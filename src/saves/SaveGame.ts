import { QueuedEventData } from "../world/events/QueuedEvent"
import { TaxRate } from "../world/TaxRate"
import { DudeSaveState } from "./DudeSaveState"
import { LocationManagerSaveState } from "./LocationManagerSaveState"

export class Save {
    version: number
    timeSaved: number
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
    plumeIndex?: number = 16
    townStats?: { [key: string]: number }
    timePlayed?: number = 0
    taxRate?: TaxRate = TaxRate.NONE

    // miscellaneous flags and values for game progress milestones
    hasMadeFire?: boolean = false
    hasRecruitedAnyVillagers?: boolean = false
    lastCampfireRestTime?: number = Number.MIN_SAFE_INTEGER
    hasDied?: boolean = false

    // stored in a location-agnostic spot, in state so that it is persisted easily
    onlinePlayers?: Record<string, Partial<DudeSaveState> & { uuid: string; password: string }> = {}
}
