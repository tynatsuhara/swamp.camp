import { Point } from "../../../engine/point"
import { Tilesets, TILE_SIZE } from "../../graphics/Tilesets"
import { GroundComponent } from "./GroundComponent"
import { Entity } from "../../../engine/Entity"
import { GroundType, MakeGroundFuncData } from "./Ground"
import { GroundRenderer } from "../GroundRenderer"
import { StaticTileSource } from "../../../engine/tiles/StaticTileSource"
import { Component } from "../../../engine/component"
import { ImageRender } from "../../../engine/renderer/ImageRender"
import { TileTransform } from "../../../engine/tiles/TileTransform"

const INDEX = "i"
const TALL_GRASS_COUNT = "t"

export const makeGrass = (d: MakeGroundFuncData): GroundComponent => {
    let tile: StaticTileSource
    const index = d.data[INDEX] ?? (Math.random() < .65 ? Math.floor(Math.random() * 4) : 0)
    const tallGrass = d.data[TALL_GRASS_COUNT] ?? (Math.random() < 0.05 ? 1 : 0)

    if (index > 0) {
        tile = Tilesets.instance.tilemap.getTileAt(new Point(0, index))
    } else {
        tile = Tilesets.instance.tilemap.getTileAt(new Point(0, 7))
    }

    GroundRenderer.instance.addTile(d.wl, d.pos, tile)

    const e = new Entity()

    for (let i = 0; i < tallGrass; i++) {
        const offset = new Point(
            -6 + Math.round(Math.random() * 11), 
            -TILE_SIZE + 1 + Math.round(Math.random() * (TILE_SIZE - 1))
        )
        const grassPos = d.pos.times(TILE_SIZE).plus(offset)

        const component = Tilesets.instance.outdoorTiles
                .getTileSource(`grass${Math.ceil(Math.random() * 2)}`)
                .toComponent(new TileTransform(grassPos))
        component.transform.depth = grassPos.y + TILE_SIZE
        e.addComponent(component)
    }

    return e.addComponent(new GroundComponent(
        GroundType.GRASS, 
        () => ({ 
            [INDEX]: index,
            [TALL_GRASS_COUNT]: tallGrass
        })
    ))
}
