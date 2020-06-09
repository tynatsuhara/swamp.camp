import { TILE_SIZE, Tilesets } from "../../graphics/Tilesets"
import { GroundComponent } from "./GroundComponent"
import { Entity } from "../../../engine/Entity"
import { GroundType, MakeGroundFuncData } from "./Ground"
import { TileTransform } from "../../../engine/tiles/TileTransform"

// Function that takes a tileSource and returns a ground generation function for it
export const makeBasicGround = (d: MakeGroundFuncData) => {
    const key = d.data["k"]
    const tile = Tilesets.instance.getBasicTileSource(key)
    const c = tile.toComponent(new TileTransform(d.pos.times(TILE_SIZE)))
    c.transform.depth = Number.MIN_SAFE_INTEGER
    return new Entity([c]).addComponent(new GroundComponent(GroundType.BASIC, () => d.data))
}

export const makeBasicNineSliceGround = (d: MakeGroundFuncData) => {
    const key = d.data["k"]
    const slice = Tilesets.instance.getBasicTileNineSlice(key)
    const nineSliceIndex = d.data["i"]
    const c = slice[nineSliceIndex].toComponent(new TileTransform(d.pos.times(TILE_SIZE)))
    c.transform.depth = Number.MIN_SAFE_INTEGER
    return new Entity([c]).addComponent(new GroundComponent(GroundType.BASIC_NINE_SLICE, () => d.data))
}