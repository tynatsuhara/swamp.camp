import { Point } from "../../../engine/point"
import { TILE_SIZE, Tilesets } from "../../graphics/Tilesets"
import { BoxCollider } from "../../../engine/collision/BoxCollider"
import { WorldLocation } from "../WorldLocation"
import { TileComponent } from "../../../engine/tiles/TileComponent"
import { TileTransform } from "../../../engine/tiles/TileTransform"
import { Entity } from "../../../engine/Entity"
import { Hittable } from "./Hittable"
import { spawnItem, Items } from "../../items/Items"
import { makeHittable } from "./HittableResource"
import { ElementComponent } from "./ElementComponent"
import { ElementType } from "./Elements"

export const makeRock = (wl: WorldLocation, pos: Point, data: object): ElementComponent => {
    const e = new Entity()
    const variation = data["v"] ?? Math.floor(Math.random() * 3) + 1
    const mossy = data["m"] ?? Math.random() > .7
    const flipped = data["f"] ?? Math.random() > .5

    const tile = e.addComponent(new TileComponent(
        Tilesets.instance.outdoorTiles.getTileSource(`rock${variation}${mossy ? 'mossy' : ''}`), 
        new TileTransform(pos.times(TILE_SIZE))
    ))
    tile.transform.depth = (pos.y + 1) * TILE_SIZE - /* prevent weapon from clipping */ 5
    tile.transform.mirrorX = flipped

    // TODO
    const hitboxDims = new Point(12, 4)
    e.addComponent(new BoxCollider(
        pos.plus(new Point(.5, 1)).times(TILE_SIZE).minus(new Point(hitboxDims.x/2, hitboxDims.y + 2)), 
        hitboxDims
    ))

    makeHittable(e, pos.plus(new Point(.5, .5)).times(TILE_SIZE), [tile.transform], Items.ROCK)

    return e.addComponent(new ElementComponent(
        ElementType.ROCK, 
        [pos], 
        () => { return { v: variation, m: mossy, f: flipped } }
    ))
}
