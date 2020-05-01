import { GroundComponent } from "./GroundComponent"
import { WorldLocation } from "../WorldLocation"
import { Point } from "../../../engine/point"
import { Entity } from "../../../engine/Entity"
import { ConnectingTile } from "../../../engine/tiles/ConnectingTile"
import { GroundType, Ground } from "./Ground"

// const oldPathSchema = new ConnectingTileSchema()
//     .vertical(Tilesets.instance.outdoorTiles.getTileAt(new Point(9, 7)))
//     .angle(Tilesets.instance.outdoorTiles.getTileAt(new Point(7, 7)))
//     .tShape(Tilesets.instance.outdoorTiles.getTileAt(new Point(5, 8)))
//     .plusShape(Tilesets.instance.outdoorTiles.getTileAt(new Point(7, 12)))
//     .cap(Tilesets.instance.outdoorTiles.getTileAt(new Point(6, 11)))
//     .single(Tilesets.instance.outdoorTiles.getTileAt(new Point(8, 12)))

// TODO fix this initializing before Tilesets.instance
// export const PATH_CONNECTING_SCHEMA = new ConnectingTileSchema()
//         .vertical(Tilesets.instance.tilemap.getTileAt(new Point(2, 6)))
//         .angle(Tilesets.instance.tilemap.getTileAt(new Point(0, 5)))
//         .tShape(Tilesets.instance.tilemap.getTileAt(new Point(3, 5)))
//         .plusShape(Tilesets.instance.tilemap.getTileAt(new Point(5, 5)))
//         .cap(Tilesets.instance.tilemap.getTileAt(new Point(2, 6)))
//         .single(Tilesets.instance.tilemap.getTileAt(new Point(7, 5)))

export const makePath = (wl: WorldLocation, pos: Point): GroundComponent => {
    const e = new Entity()
    const c = new ConnectingTile(Ground.instance.PATH_CONNECTING_SCHEMA, wl.ground, pos)
    e.addComponent(c)
    return e.addComponent(new GroundComponent(GroundType.PATH))
}