import { Entity } from "brigsby/lib"
import { SpriteTransform } from "brigsby/lib/sprites"
import { Tilesets, TILE_SIZE } from "../../graphics/Tilesets"
import { GroundRenderer } from "../GroundRenderer"
import { GroundType, MakeGroundFuncData } from "./Ground"
import { GroundComponent } from "./GroundComponent"

// Function that takes a tileSource and returns a ground generation function for it
export const makeBasicGround = (d: MakeGroundFuncData) => {
    const key = d.data.k
    const e = new Entity()
    if (key) {
        const tile = Tilesets.instance.getBasicTileSource(key)
        const c = tile.toComponent(new SpriteTransform(d.pos.times(TILE_SIZE)))
        c.transform.depth = GroundRenderer.DEPTH
        e.addComponent(c)
    }
    return e.addComponent(new GroundComponent(GroundType.BASIC, () => d.data))
}

export const makeBasicNineSliceGround = (d: MakeGroundFuncData) => {
    const key = d.data.k
    const slice = Tilesets.instance.getBasicTileNineSlice(key)
    const nineSliceIndex = d.data.i
    const c = slice[nineSliceIndex].toComponent(new SpriteTransform(d.pos.times(TILE_SIZE)))
    c.transform.depth = GroundRenderer.DEPTH
    return new Entity([c]).addComponent(
        new GroundComponent(GroundType.BASIC_NINE_SLICE, () => d.data)
    )
}
