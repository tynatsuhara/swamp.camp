import { DudeSaveState } from "./DudeSaveState"
import { SavedElement } from "../world/elements/Elements"

export class LocationSaveState {
    uuid: string
    ground: { [key: string]: string }
    elements: SavedElement[]  // maps (x,y) coord string to things on the grid and whatever metadata they require
    dudes: DudeSaveState[]
}