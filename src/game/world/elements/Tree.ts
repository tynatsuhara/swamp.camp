import { Point } from "../../../engine/point"
import { TILE_SIZE, Tilesets } from "../../graphics/Tilesets"
import { BoxCollider } from "../../../engine/collision/BoxCollider"
import { WorldLocation } from "../WorldLocation"
import { TileComponent } from "../../../engine/tiles/TileComponent"
import { TileTransform } from "../../../engine/tiles/TileTransform"
import { Entity } from "../../../engine/Entity"
import { Items } from "../../items/Items"
import { makeHittable } from "./HittableResource"
import { ElementComponent } from "./ElementComponent"
import { ElementType } from "./Elements"

export enum TreeType {
    ROUND = 1,
    POINTY = 2,
}

export const makeTree = (wl: WorldLocation, pos: Point, type: TreeType): ElementComponent => {
    const e = new Entity()
    const depth = (pos.y + 2) * TILE_SIZE
    type = type ?? Math.random() < .7 ? TreeType.POINTY : TreeType.ROUND
    const top = addTile(e, `tree${type}top`, pos, depth)
    const bottom = addTile(e, `tree${type}base`, pos.plus(new Point(0, 1)), depth)
    const hitboxDims = new Point(8, 3)
    
    e.addComponent(new BoxCollider(
        pos.plus(new Point(.5, 2)).times(TILE_SIZE).minus(new Point(hitboxDims.x/2, hitboxDims.y)), 
        hitboxDims
    ))

    const hittableCenter = pos.times(TILE_SIZE).plus(new Point(TILE_SIZE/2, TILE_SIZE + TILE_SIZE/2))  // center of bottom tile
    makeHittable(e, hittableCenter, [top.transform, bottom.transform], Items.WOOD)

    return e.addComponent(new ElementComponent(
        ElementType.TREE, 
        [pos, pos.plusY(1)], 
        () => { return { treeType: type } }
    ))
}

const addTile = (e: Entity, s: string, pos: Point, depth: number) => {
    const tile = e.addComponent(new TileComponent(Tilesets.instance.outdoorTiles.getTileSource(s), new TileTransform(pos.times(TILE_SIZE))))
    tile.transform.depth = depth
    return tile
}
