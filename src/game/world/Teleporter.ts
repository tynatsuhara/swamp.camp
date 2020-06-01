import { Interactable } from "./elements/Interactable"
import { Point } from "../../engine/point"
import { LocationManager } from "./LocationManager"
import { WorldLocation } from "./WorldLocation"

export type Teleporter = {
    to: string   // destination uuid
    pos: Point   // point representing where a dude will be placed by traveling to this teleporter 
    id?: string  // to distinguish multiple teleporters between the same destinations
}

export const Teleporters = {
    teleporterId: (toUUID: string, id: string = null) => {
        return `${toUUID}${!!id ? `$${id}` : ''}`
    },
}
