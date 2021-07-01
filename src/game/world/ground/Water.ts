import { GroundComponent } from "./GroundComponent"
import { Entity } from "../../../engine/Entity"
import { GroundType, MakeGroundFuncData } from "./Ground"
import { ConnectingTile } from "./ConnectingTile"
import { ConnectingTileWaterSchema } from "./ConnectingTileWaterSchema"
import { TileSetAnimation } from "../../../engine/tiles/TileSetAnimation"
import { Tilesets, TILE_SIZE } from "../../graphics/Tilesets"
import { Point } from "../../../engine/Point"
import { TileTransform } from "../../../engine/tiles/TileTransform"

export const makeWater = (d: MakeGroundFuncData): GroundComponent => {
    
    const animationSpeed = 750
    const waterAnimation = new TileSetAnimation([
        [Tilesets.instance.tilemap.getTileAt(new Point(6, 0)), animationSpeed],
        [Tilesets.instance.tilemap.getTileAt(new Point(6, 1)), animationSpeed],
        // [Tilesets.instance.tilemap.getTileAt(new Point(6, 2)), animationSpeed],
    ]).toComponent(TileTransform.new({ 
        position: d.pos.times(TILE_SIZE),
        depth: ConnectingTileWaterSchema.DEPTH,
        rotation: Math.floor(Math.random() * 4) * 90
    }))

    const schema = new ConnectingTileWaterSchema()

    const e = new Entity([
        waterAnimation,
        new ConnectingTile(schema, d.wl, d.pos)
    ])

    return e.addComponent(new GroundComponent(GroundType.WATER))
}