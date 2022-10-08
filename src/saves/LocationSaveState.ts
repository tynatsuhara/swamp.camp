import { SavedElement } from "../world/elements/Elements"
import { SavedGround } from "../world/ground/Ground"
import { LocationType } from "../world/locations/LocationManager"
import { DudeSaveState } from "./DudeSaveState"

export class LocationSaveState {
    uuid: string
    type: LocationType
    ground: SavedGround[]
    elements: SavedElement[]
    dudes: DudeSaveState[]
    teleporters: { [key: string]: string }
    barriers: object[]
    staticSprites: object[]
    isInterior: boolean
    allowPlacing: boolean
    size?: number
    levels?: { [key: string]: number }
}
