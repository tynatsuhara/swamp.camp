import { TILE_SIZE, Tilesets } from "../../graphics/Tilesets"
import { GroundComponent } from "./GroundComponent"
import { Entity } from "../../../engine/Entity"
import { GroundType, MakeGroundFuncData } from "./Ground"
import { TileTransform } from "../../../engine/tiles/TileTransform"
import { GroundRenderer } from "../GroundRenderer"

// Function that takes a tileSource and returns a ground generation function for it
export const makeBasicGround = (g: GroundType, d: MakeGroundFuncData, rotation: number) => {
    const key = d.data["k"]
    const tile = Tilesets.instance.getBasicTileSource(key)
    const c = tile.toComponent(new TileTransform(d.pos.times(TILE_SIZE)))
    c.transform.depth = GroundRenderer.DEPTH
    c.transform.rotation = rotation
    return new Entity([c]).addComponent(new GroundComponent(g, () => d.data))
}

export const makeBasicNineSliceGround = (d: MakeGroundFuncData) => {
    const key = d.data["k"]
    const slice = Tilesets.instance.getBasicTileNineSlice(key)
    const nineSliceIndex = d.data["i"]
    const c = slice[nineSliceIndex].toComponent(new TileTransform(d.pos.times(TILE_SIZE)))
    c.transform.depth = GroundRenderer.DEPTH
    return new Entity([c]).addComponent(new GroundComponent(GroundType.BASIC_NINE_SLICE, () => d.data))
}