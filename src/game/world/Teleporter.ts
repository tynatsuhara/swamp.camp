import { Interactable } from "./elements/Interactable"
import { Point } from "../../engine/point"
import { LocationManager } from "./LocationManager"
import { WorldLocation } from "./WorldLocation"
import { ElementType } from "./elements/Elements"
import { ElementComponent } from "./elements/ElementComponent"
import { Entity } from "../../engine/Entity"
import { TILE_SIZE, Tilesets } from "../graphics/Tilesets"
import { TileComponent } from "../../engine/tiles/TileComponent"
import { TileTransform } from "../../engine/tiles/TileTransform"

export type Teleporter = {
    to: string   // destination uuid
    pos: Point   // point representing where a dude will be STANDING after traveling to this teleporter 
    id?: string  // to distinguish multiple teleporters between the same destinations
}

export const Teleporters = {
    teleporterId: (toUUID: string, id: string = null) => {
        return `${toUUID}${!!id ? `$${id}` : ''}`
    },
}

export const makeTeleporterElement = (wl: WorldLocation, pos: Point, data: object): ElementComponent => {
    const e = new Entity()

    const destinationUUID = data["to"]
    const i = data["i"]  // the position for the interactable
    if (!destinationUUID || !i) {
        throw new Error("teleporter element must have 'to' and 'i' parameters")
    }
    const interactPos = Point.fromString(i)
    const id = data["id"]

    e.addComponent(new Interactable(interactPos, () => wl.useTeleporter(destinationUUID, id)))

    // TODO have the arrow pointable in different directions
    e.addComponent(new TileComponent(Tilesets.instance.oneBit.getTileSource("small_arrow_down"), new TileTransform(pos.times(TILE_SIZE))))

    return e.addComponent(new ElementComponent(
        ElementType.TELEPORTER, 
        [pos],
        () => data
    ))
}