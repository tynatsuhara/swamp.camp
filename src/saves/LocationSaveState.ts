import { DroppedItemSaveState } from "../items/DroppedItem"
import { SavedElement } from "../world/elements/Elements"
import { Feature } from "../world/features/Features"
import { SavedGround } from "../world/ground/Ground"
import { LocationType } from "../world/locations/LocationType"
import { DudeSaveState } from "./DudeSaveState"

export class LocationSaveState {
    uuid: string
    type: LocationType
    ground: SavedGround[]
    elements: SavedElement[]
    dudes: DudeSaveState[]
    features: Feature<any>[]
    isInterior: boolean
    allowPlacing: boolean
    size?: number
    levels?: { [key: string]: number }
    items?: DroppedItemSaveState[]
}
