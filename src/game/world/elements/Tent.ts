import { Point } from "../../../engine/point"
import { TILE_SIZE, Tilesets } from "../../graphics/Tilesets"
import { BoxCollider } from "../../../engine/collision/BoxCollider"
import { WorldLocation } from "../WorldLocation"
import { TileComponent } from "../../../engine/tiles/TileComponent"
import { TileTransform } from "../../../engine/tiles/TileTransform"
import { Entity } from "../../../engine/Entity"
import { Interactable } from "./Interactable"
import { LocationManager } from "../LocationManager"
import { ElementComponent } from "./ElementComponent"
import { ElementType } from "./Elements"

export const enum TentColor {
    RED = "red",
    BLUE = "blue"
}

export const makeTent = (wl: WorldLocation, pos: Point, data: object): ElementComponent => {
    const e = new Entity()

    const destinationUUID: string = data["destinationUUID"]
    const color: TentColor = data["color"] ?? TentColor.BLUE

    // TODO set up interior for tents
    // if (!destinationUUID) {
        // throw new Error("tent must have a uuid")
    // }
    
    const depth = (pos.y + 1) * TILE_SIZE + /* prevent clipping */ 5
    addTile(wl, e, `${color}tentNW`, pos, depth)
    addTile(wl, e, `${color}tentNE`, pos.plus(new Point(1, 0)), depth)
    addTile(wl, e, `${color}tentSW`, pos.plus(new Point(0, 1)), depth)
    addTile(wl, e, `${color}tentSE`, pos.plus(new Point(1, 1)), depth)
    e.addComponent(new BoxCollider(pos.plus(new Point(0, 1)).times(TILE_SIZE), new Point(TILE_SIZE*2, TILE_SIZE)))

    // e.addComponent(new Interactable(pos.plus(new Point(1, 2)).times(TILE_SIZE), () => {
    //     wl.manager.transition(destinationUUID)
    // }))

    return e.addComponent(new ElementComponent(
        ElementType.TENT, 
        [pos, pos.plusX(1), pos.plusY(1), new Point(pos.x+1, pos.y+1)], 
        () => { return { destinationUUID, color } }
    ))
}

const addTile = (wl: WorldLocation, e: Entity, s: string, pos: Point, depth: number) => {
    const tile = e.addComponent(new TileComponent(Tilesets.instance.outdoorTiles.getTileSource(s), new TileTransform(pos.times(TILE_SIZE))))
    tile.transform.depth = depth
}
