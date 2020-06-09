import { Point } from "../../../engine/point"
import { Tilesets } from "../../graphics/Tilesets"
import { GroundComponent } from "./GroundComponent"
import { Entity } from "../../../engine/Entity"
import { GroundType, MakeGroundFuncData } from "./Ground"
import { GroundRenderer } from "../GroundRenderer"
import { StaticTileSource } from "../../../engine/tiles/StaticTileSource"

export const makeGrass = (d: MakeGroundFuncData): GroundComponent => {
    let tile: StaticTileSource
    const index = d.data["index"] ?? (Math.random() < .65 ? Math.floor(Math.random() * 4) : 0)

    if (index > 0) {
        tile = Tilesets.instance.tilemap.getTileAt(new Point(0, index))
    } else {
        tile = Tilesets.instance.tilemap.getTileAt(new Point(0, 7))
    }

    GroundRenderer.instance.addTile(d.wl, d.pos, tile)

    return new Entity().addComponent(new GroundComponent(GroundType.GRASS, () => { return { index } }))
}