import { GroundComponent } from "./GroundComponent"
import { Entity } from "../../../engine/Entity"
import { GroundType, MakeGroundFuncData } from "./Ground"
import { ConnectingTile } from "./ConnectingTile"
import { ConnectingTileWaterSchema } from "./ConnectingTileWaterSchema"
import { SpriteAnimation } from "../../../engine/sprites/SpriteAnimation"
import { Tilesets, TILE_SIZE } from "../../graphics/Tilesets"
import { Point } from "../../../engine/Point"
import { SpriteTransform } from "../../../engine/sprites/SpriteTransform"
import { GroundRenderer } from "../GroundRenderer"

export const makeWater = (d: MakeGroundFuncData): GroundComponent => {
    
    const schema = new ConnectingTileWaterSchema()

    const e = new Entity([
        getAnimatedWaterTileComponent(d.pos),
        new ConnectingTile(schema, d.wl, d.pos)
    ])

    return e.addComponent(new GroundComponent(GroundType.WATER))
}

export const getAnimatedWaterTileComponent = (pos: Point) => {
    const animationSpeed = 750
    return new SpriteAnimation([
        [Tilesets.instance.tilemap.getTileAt(new Point(6, 0)), animationSpeed],
        [Tilesets.instance.tilemap.getTileAt(new Point(6, 1)), animationSpeed],
        // [Tilesets.instance.tilemap.getTileAt(new Point(6, 2)), animationSpeed],
    ]).toComponent(SpriteTransform.new({ 
        position: pos.times(TILE_SIZE),
        depth: GroundRenderer.DEPTH - 5,
        rotation: Math.floor(Math.random() * 4) * 90
    }))
}
