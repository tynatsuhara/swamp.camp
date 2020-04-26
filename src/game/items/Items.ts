import { Tilesets } from "../graphics/Tilesets"
import { Entity } from "../../engine/Entity"
import { LocationManager } from "../world/LocationManager"
import { DroppedItem } from "./DroppedItem"
import { Point } from "../../engine/point"
import { TileSource } from "../../engine/tiles/TileSource"
import { Collider } from "../../engine/collision/Collider"

export class Item {
    readonly droppedIconSupplier: () => TileSource
    readonly stackLimit: number

    constructor(
        droppedIconSupplier: () => TileSource,
        stackLimit: number = 1
    ) {
        this.droppedIconSupplier = droppedIconSupplier
        this.stackLimit = stackLimit
    }
}

export const Items = {
    COIN: new Item(() => Tilesets.instance.dungeonCharacters.getTileSetAnimation("coin_anim", 150)),
    ROCK: new Item(() => Tilesets.instance.outdoorTiles.getTileSource("rockItem"), 100),
    WOOD: new Item(() => Tilesets.instance.outdoorTiles.getTileSource("woodItem"), 100),
}

/**
 * @param position The bottom center where the item should be placed
 * 
 * TODO: Add initial velocity
 */
export const spawnItem = (pos: Point, item: Item, velocity: Point = new Point(0, 0), sourceCollider: Collider = null) => {
    LocationManager.instance.currentLocation.dynamic.add(new Entity([new DroppedItem(pos, item, velocity, sourceCollider)]))
}