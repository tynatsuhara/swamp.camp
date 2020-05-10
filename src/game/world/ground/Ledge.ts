import { TileSource } from "../../../engine/tiles/TileSource"
import { WorldLocation } from "../WorldLocation"
import { Point } from "../../../engine/point"
import { Tilesets, TILE_SIZE } from "../../graphics/Tilesets"
import { GroundComponent } from "./GroundComponent"
import { Entity } from "../../../engine/Entity"
import { GroundType } from "./Ground"
import { TileTransform } from "../../../engine/tiles/TileTransform"

export const makeLedge = (wl: WorldLocation, pos: Point, data: object): GroundComponent => {
    const c = Tilesets.instance.tilemap.getTileAt(new Point(3, 2)).toComponent(new TileTransform(pos.times(TILE_SIZE)))
    c.transform.depth = Number.MIN_SAFE_INTEGER
    return new Entity([c]).addComponent(new GroundComponent(GroundType.GRASS, () => { return {} }))
}