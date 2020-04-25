import { Point } from "../../../engine/point"
import { TILE_SIZE, Tilesets } from "../../graphics/Tilesets"
import { BoxCollider } from "../../../engine/collision/BoxCollider"
import { WorldLocation } from "../WorldLocation"
import { TileComponent } from "../../../engine/tiles/TileComponent"
import { TileTransform } from "../../../engine/tiles/TileTransform"
import { Entity } from "../../../engine/Entity"
import { Interactable } from "./Interactable"
import { LocationManager } from "../LocationManager"

export enum TentColor {
    RED = "red",
    BLUE = "blue"
}

export const makeTent = (wl: WorldLocation, pos: Point, color: TentColor, teleportTo: WorldLocation) => {
    const e = new Entity()
    const depth = (pos.y + 1) * TILE_SIZE + /* prevent clipping */ 5
    addTile(wl, e, `${color}tentNW`, pos, depth)
    addTile(wl, e, `${color}tentNE`, pos.plus(new Point(1, 0)), depth)
    addTile(wl, e, `${color}tentSW`, pos.plus(new Point(0, 1)), depth)
    addTile(wl, e, `${color}tentSE`, pos.plus(new Point(1, 1)), depth)
    e.addComponent(new BoxCollider(pos.plus(new Point(0, 1)).times(TILE_SIZE), new Point(TILE_SIZE*2, TILE_SIZE), false))
    e.addComponent(new Interactable(pos.plus(new Point(1, 2)).times(TILE_SIZE), () => {
        LocationManager.instance.transition(teleportTo)
    }))
}

const addTile = (wl: WorldLocation, e: Entity, s: string, pos: Point, depth: number) => {
    wl.stuff.set(pos, e)
    const tile = e.addComponent(new TileComponent(Tilesets.instance.outdoorTiles.getTileSource(s), new TileTransform(pos.times(TILE_SIZE))))
    tile.transform.depth = depth
}
