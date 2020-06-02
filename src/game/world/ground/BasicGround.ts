import { TileSource } from "../../../engine/tiles/TileSource"
import { WorldLocation } from "../WorldLocation"
import { Point } from "../../../engine/point"
import { TILE_SIZE } from "../../graphics/Tilesets"
import { GroundComponent } from "./GroundComponent"
import { Entity } from "../../../engine/Entity"
import { GroundType, MakeGroundFuncData } from "./Ground"
import { TileTransform } from "../../../engine/tiles/TileTransform"

// Function that takes a tileSource and returns a ground generation function for it
// export const makeBasicGround = (type: GroundType, tile: TileSource): (d: MakeGroundFuncData) => GroundComponent => {
//     return (wl: WorldLocation, pos: Point, data: object): GroundComponent => {
//         const c = tile.toComponent(new TileTransform(pos.times(TILE_SIZE)))
//         c.transform.depth = Number.MIN_SAFE_INTEGER
//         return new Entity([c]).addComponent(new GroundComponent(type, () => { return {} }))
//     }
// }

export const makeBasicNineSliceGround = (d: MakeGroundFuncData, type: GroundType, slice: TileSource[]) => {
    const nineSliceIndex = d.data["i"]
    const c = slice[nineSliceIndex].toComponent(new TileTransform(d.pos.times(TILE_SIZE)))
    c.transform.depth = Number.MIN_SAFE_INTEGER
    return new Entity([c]).addComponent(new GroundComponent(type, () => d.data))
}