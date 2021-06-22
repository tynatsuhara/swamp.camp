import { Point } from "../../../engine/Point"
import { Tilesets, TILE_SIZE } from "../../graphics/Tilesets"
import { GroundComponent } from "./GroundComponent"
import { Entity } from "../../../engine/Entity"
import { GroundType, MakeGroundFuncData } from "./Ground"
import { TileTransform } from "../../../engine/tiles/TileTransform"
import { GroundRenderer } from "../GroundRenderer"

// TODO probably get rid of this
export const makeLedge = (d: MakeGroundFuncData): GroundComponent => {
    const c = Tilesets.instance.tilemap.getTileAt(new Point(3, 2)).toComponent(new TileTransform(d.pos.times(TILE_SIZE)))
    c.transform.depth = GroundRenderer.DEPTH + 1
    return new Entity([c]).addComponent(new GroundComponent(GroundType.LEDGE))
}