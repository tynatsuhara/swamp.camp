import { LocationManagerSaveState } from "./LocationManagerSaveState"
import { QueuedEventData } from "../world/events/QueuedEvent"
import { Color } from "../ui/Color"

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
    plume?: Color[]
    townStats?: { [key: string]: number }
}