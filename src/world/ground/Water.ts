import { Entity } from "brigsby/dist/Entity"
import { Point } from "brigsby/dist/Point"
import { SpriteAnimation } from "brigsby/dist/sprites/SpriteAnimation"
import { SpriteTransform } from "brigsby/dist/sprites/SpriteTransform"
import { Tilesets, TILE_SIZE } from "../../graphics/Tilesets"
import { GroundRenderer } from "../GroundRenderer"
import { ConnectingTile } from "./ConnectingTile"
import { ConnectingTileWaterSchema } from "./ConnectingTileWaterSchema"
import { GroundType, MakeGroundFuncData } from "./Ground"
import { GroundComponent } from "./GroundComponent"

export const makeWater = (d: MakeGroundFuncData): GroundComponent => {
    const schema = new ConnectingTileWaterSchema()

    const e = new Entity([
        getAnimatedWaterTileComponent(d.pos),
        new ConnectingTile(schema, d.wl, d.pos),
    ])

    return e.addComponent(new GroundComponent(GroundType.WATER))
}

// TODO: Make the animation static somehow so the tiles are always in sync
export const getAnimatedWaterTileComponent = (pos: Point) => {
    const animationSpeed = 750
    return new SpriteAnimation([
        [Tilesets.instance.tilemap.getTileAt(new Point(6, 0)), animationSpeed],
        [Tilesets.instance.tilemap.getTileAt(new Point(6, 1)), animationSpeed],
        // [Tilesets.instance.tilemap.getTileAt(new Point(6, 2)), animationSpeed],
    ]).toComponent(
        SpriteTransform.new({
            position: pos.times(TILE_SIZE),
            depth: GroundRenderer.DEPTH - 5,
            rotation: Math.floor(Math.random() * 4) * 90,
        })
    )
}
