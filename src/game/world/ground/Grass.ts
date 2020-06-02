import { TileSource } from "../../../engine/tiles/TileSource"
import { WorldLocation } from "../WorldLocation"
import { Point } from "../../../engine/point"
import { Tilesets, TILE_SIZE } from "../../graphics/Tilesets"
import { GroundComponent } from "./GroundComponent"
import { Entity } from "../../../engine/Entity"
import { GroundType, MakeGroundFuncData } from "./Ground"
import { TileTransform } from "../../../engine/tiles/TileTransform"

export const makeGrass = (d: MakeGroundFuncData): GroundComponent => {
    let tile: TileSource
    const index = d.data["index"] ?? (Math.random() < .65 ? Math.floor(Math.random() * 4) : 0)

    if (index > 0) {
        tile = Tilesets.instance.tilemap.getTileAt(new Point(0, index))
    } else {
        tile = Tilesets.instance.tilemap.getTileAt(new Point(0, 7))
    }

    const c = tile.toComponent(new TileTransform(d.pos.times(TILE_SIZE)))
    c.transform.depth = Number.MIN_SAFE_INTEGER
    return new Entity([c]).addComponent(new GroundComponent(GroundType.GRASS, () => { return { index } }))
}