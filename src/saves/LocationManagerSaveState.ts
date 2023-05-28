import { TeleporterV2 } from "../world/Teleporter"
import { LocationSaveState } from "./LocationSaveState"
export class LocationManagerSaveState {
    values: LocationSaveState[]
    currentLocationUUID: string
    teleporters: Record<string, TeleporterV2>
}
