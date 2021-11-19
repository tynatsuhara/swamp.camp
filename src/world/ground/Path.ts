import { Entity } from "brigsby/dist/Entity"
import { Point } from "brigsby/dist/Point"
import { Tilesets } from "../../graphics/Tilesets"
import { ConnectingTile } from "./ConnectingTile"
import { ConnectingTilePathSchema } from "./ConnectingTilePathSchema"
import { GroundType, MakeGroundFuncData } from "./Ground"
import { GroundComponent } from "./GroundComponent"

export const makePath = (d: MakeGroundFuncData): GroundComponent => {
    const schema = new ConnectingTilePathSchema(GroundType.PATH)
        .cap(Tilesets.instance.tilemap.getTileAt(new Point(Math.floor(Math.random() * 4), 6)))
        .single(Tilesets.instance.tilemap.getTileAt(new Point(6, 5)))
        .corners(Tilesets.instance.tilemap.getTileAt(new Point(Math.floor(Math.random() * 4), 5)))

    const e = new Entity([new ConnectingTile(schema, d.wl, d.pos)])

    return e.addComponent(new GroundComponent(GroundType.PATH))
}
