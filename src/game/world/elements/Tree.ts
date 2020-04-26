import { Point } from "../../../engine/point"
import { TILE_SIZE, Tilesets } from "../../graphics/Tilesets"
import { BoxCollider } from "../../../engine/collision/BoxCollider"
import { WorldLocation } from "../WorldLocation"
import { TileComponent } from "../../../engine/tiles/TileComponent"
import { TileTransform } from "../../../engine/tiles/TileTransform"
import { Entity } from "../../../engine/Entity"
import { Hittable } from "./Hittable"
import { Items, spawnItem } from "../../items/Items"

export enum TreeType {
    ROUND = 1,
    POINTY = 2,
}

export const makeTree = (wl: WorldLocation, pos: Point, type: TreeType) => {
    const e = new Entity()
    const depth = (pos.y + 2) * TILE_SIZE
    const top = addTile(wl, e, `tree${type}top`, pos, depth)
    const bottom = addTile(wl, e, `tree${type}base`, pos.plus(new Point(0, 1)), depth)
    const hitboxDims = new Point(8, 3)
    e.addComponent(new BoxCollider(
        pos.plus(new Point(.5, 2)).times(TILE_SIZE).minus(new Point(hitboxDims.x/2, hitboxDims.y)), 
        hitboxDims
    ))

    const hittableCenter = pos.times(TILE_SIZE).plus(new Point(TILE_SIZE/2, TILE_SIZE + TILE_SIZE/2))
    e.addComponent(new Hittable(
        hittableCenter,
        [top.transform, bottom.transform],
        hitDir => {
            spawnItem(
                hittableCenter.plus(new Point(0, TILE_SIZE/2)).plus(hitDir.times(10)), 
                Items.WOOD, 
                hitDir
            )  // TODO rock item
        }
    ))
}

const addTile = (wl: WorldLocation, e: Entity, s: string, pos: Point, depth: number) => {
    wl.stuff.set(pos, e)
    const tile = e.addComponent(new TileComponent(Tilesets.instance.outdoorTiles.getTileSource(s), new TileTransform(pos.times(TILE_SIZE))))
    tile.transform.depth = depth
    return tile
}
