import { Point } from "../../../engine/point"
import { TILE_SIZE, Tilesets } from "../../graphics/Tilesets"
import { BoxCollider } from "../../../engine/collision/BoxCollider"
import { WorldLocation } from "../WorldLocation"
import { TileComponent } from "../../../engine/tiles/TileComponent"
import { TileTransform } from "../../../engine/tiles/TileTransform"
import { Entity } from "../../../engine/Entity"
import { Interactable } from "./Interactable"
import { ElementComponent } from "./ElementComponent"
import { ElementType } from "./Elements"
import { ElementUtils } from "./ElementUtils"
import { makeTentInterior } from "../interior/Tent"
import { Player } from "../../characters/Player"
import { Teleporters } from "../Teleporter"

export const enum TentColor {
    RED = "red",
    BLUE = "blue"
}

export const makeTent = (wl: WorldLocation, pos: Point, data: object): ElementComponent => {
    const e = new Entity()

    const destinationUUID: string = data["destinationUUID"] ?? makeTentInterior(wl).uuid
    const color: TentColor = data["color"] ?? TentColor.BLUE

    const interactablePos = pos.plus(new Point(2, 2)).times(TILE_SIZE)
    const sourceTeleporter = { to: destinationUUID, pos: interactablePos.plusY(12) }
    wl.addTeleporter(sourceTeleporter)
    
    // Set up tiles
    const depth = (pos.y + 1) * TILE_SIZE + /* prevent clipping */ 5
    addTile(wl, e, `${color}tentNW`, pos.plusX(1), depth)
    addTile(wl, e, `${color}tentNE`, pos.plus(new Point(2, 0)), depth)
    addTile(wl, e, `${color}tentSW`, pos.plus(new Point(1, 1)), depth)
    addTile(wl, e, `${color}tentSE`, pos.plus(new Point(2, 1)), depth)
    e.addComponent(new BoxCollider(pos.plus(new Point(1, 1)).times(TILE_SIZE), new Point(TILE_SIZE*2, TILE_SIZE)))


    // Set up teleporter
    e.addComponent(new Interactable(interactablePos, () => wl.useTeleporter(destinationUUID)))


    return e.addComponent(new ElementComponent(
        ElementType.TENT, 
        ElementUtils.rectPoints(pos, new Point(4, 3)),
        () => { return { destinationUUID, color } }
    ))
}

const addTile = (wl: WorldLocation, e: Entity, s: string, pos: Point, depth: number) => {
    const tile = e.addComponent(new TileComponent(Tilesets.instance.outdoorTiles.getTileSource(s), new TileTransform(pos.times(TILE_SIZE))))
    tile.transform.depth = depth
}
