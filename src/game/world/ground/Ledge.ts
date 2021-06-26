import { TileSource } from "../../../engine/tiles/TileSource"
import { WorldLocation } from "../WorldLocation"
import { Point } from "../../../engine/Point"
import { Tilesets, TILE_SIZE } from "../../graphics/Tilesets"
import { GroundComponent } from "./GroundComponent"
import { Entity } from "../../../engine/Entity"
import { GroundType, MakeGroundFuncData } from "./Ground"
import { TileTransform } from "../../../engine/tiles/TileTransform"
import { ConnectingTileLedgeSchema } from "./ConnectingTileLedgeSchema"
import { ConnectingTile } from "./ConnectingTile"

// TODO probably get rid of this
export const makeLedge = (d: MakeGroundFuncData): GroundComponent => {
    const schema = new ConnectingTileLedgeSchema()

    const e = new Entity([
        new ConnectingTile(schema, d.wl, d.pos)
    ])

    return e.addComponent(new GroundComponent(GroundType.LEDGE))
}