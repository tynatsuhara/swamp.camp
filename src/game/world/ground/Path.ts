import { GroundComponent } from "./GroundComponent"
import { Point } from "../../../engine/Point"
import { Entity } from "../../../engine/Entity"
import { ConnectingTile } from "./ConnectingTile"
import { GroundType, MakeGroundFuncData } from "./Ground"
import { Tilesets } from "../../graphics/Tilesets"
import { ConnectingTilePathSchema } from "./ConnectingTilePathSchema"

export const makePath = (d: MakeGroundFuncData): GroundComponent => {
    const schema = new ConnectingTilePathSchema(GroundType.PATH)
        .cap(Tilesets.instance.tilemap.getTileAt(
            new Point(Math.floor(Math.random() * 4), 6)
        ))
        .single(Tilesets.instance.tilemap.getTileAt(
            new Point(6, 5)
        ))
        .corners(Tilesets.instance.tilemap.getTileAt(
            new Point(Math.floor(Math.random() * 4), 5)
        ))

    const e = new Entity([
        new ConnectingTile(schema, d.wl.ground, d.pos)
    ])

    return e.addComponent(new GroundComponent(GroundType.PATH))
}