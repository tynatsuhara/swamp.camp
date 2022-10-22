import { SavedElement } from "../world/elements/Elements"
import { Feature } from "../world/features/Features"
import { SavedGround } from "../world/ground/Ground"
import { LocationType } from "../world/locations/LocationManager"
import { DudeSaveState } from "./DudeSaveState"

export class LocationSaveState {
    uuid: string
    type: LocationType
    ground: SavedGround[]
    elements: SavedElement[]
    dudes: DudeSaveState[]
    features: Feature<any>[]
    teleporters: { [key: string]: string }
    isInterior: boolean
    allowPlacing: boolean
    size?: number
    levels?: { [key: string]: number }
}
