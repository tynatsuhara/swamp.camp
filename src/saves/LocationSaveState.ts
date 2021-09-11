import { DudeSaveState } from "./DudeSaveState"
import { SavedElement } from "../world/elements/Elements"
import { SavedGround } from "../world/ground/Ground"

export class LocationSaveState {
    uuid: string
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