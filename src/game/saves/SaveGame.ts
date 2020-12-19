import { LocationManagerSaveState } from "./LocationManagerSaveState"
import { QueuedEventData } from "../world/events/QueuedEvent"

export class Save {
    timeSaved: number
    saveVersion: number
    locations: LocationManagerSaveState
    worldTime: number
    eventQueue: QueuedEventData[]
    blob: object
}