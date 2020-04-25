import { Point } from "../../../engine/point"
import { TILE_SIZE, Tilesets } from "../../graphics/Tilesets"
import { BoxCollider } from "../../../engine/collision/BoxCollider"
import { WorldLocation } from "../WorldLocation"
import { TileComponent } from "../../../engine/tiles/TileComponent"
import { TileTransform } from "../../../engine/tiles/TileTransform"
import { Entity } from "../../../engine/Entity"
import { Hittable } from "./Hittable"


export const makeRock = (wl: WorldLocation, pos: Point) => {
    const e = new Entity()
    const variation = Math.floor(Math.random() * 3) + 1
    const mossy = Math.random() > .7

    const tile = e.addComponent(new TileComponent(
        Tilesets.instance.outdoorTiles.getTileSource(`rock${variation}${mossy ? 'mossy' : ''}`), 
        new TileTransform(pos.times(TILE_SIZE))
    ))
    tile.transform.depth = (pos.y + 1) * TILE_SIZE
    tile.transform.mirrorX = Math.random() > .5

    // TODO
    const hitboxDims = new Point(12, 4)
    e.addComponent(new BoxCollider(
        pos.plus(new Point(.5, 1)).times(TILE_SIZE).minus(new Point(hitboxDims.x/2, hitboxDims.y + 2)), 
        hitboxDims
    ))

    e.addComponent(new Hittable(pos.plus(new Point(.5, .5)).times(TILE_SIZE), [tile.transform]))

    wl.stuff.set(pos, e)
}
