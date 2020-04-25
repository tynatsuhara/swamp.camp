import { Component } from "../../../engine/component"
import { TileSource } from "../../../engine/tiles/TileSource"
import { Point } from "../../../engine/point"
import { TILE_SIZE, Tilesets } from "../../graphics/Tilesets"
import { BoxCollider } from "../../../engine/collision/BoxCollider"
import { WorldLocation } from "../WorldLocation"
import { TileComponent } from "../../../engine/tiles/TileComponent"
import { TileTransform } from "../../../engine/tiles/TileTransform"
import { Entity } from "../../../engine/Entity"

export enum TentColor {
    red = "red",
    blue = "blue"
}

export const makeTent = (wl: WorldLocation, pos: Point, color: TentColor) => {
    const e = new Entity()
    const depth = (pos.y + 1) * TILE_SIZE + /* prevent clipping */ 5
    addTile(wl, e, `${color}tentNW`, pos, depth)
    addTile(wl, e, `${color}tentNE`, pos.plus(new Point(1, 0)), depth)
    addTile(wl, e, `${color}tentSW`, pos.plus(new Point(0, 1)), depth)
    addTile(wl, e, `${color}tentSE`, pos.plus(new Point(1, 1)), depth)
    e.addComponent(new BoxCollider(pos.plus(new Point(0, 1)).times(TILE_SIZE), new Point(TILE_SIZE*2, TILE_SIZE), false))
}

const addTile = (wl: WorldLocation, e: Entity, s: string, pos: Point, depth: number) => {
    wl.stuff.set(pos, e)
    const tile = e.addComponent(new TileComponent(Tilesets.instance.outdoorTiles.getTileSource(s), new TileTransform(pos.times(TILE_SIZE))))
    tile.transform.depth = depth
}
