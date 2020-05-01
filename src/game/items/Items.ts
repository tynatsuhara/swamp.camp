import { Tilesets } from "../graphics/Tilesets"
import { Entity } from "../../engine/Entity"
import { LocationManager } from "../world/LocationManager"
import { DroppedItem } from "./DroppedItem"
import { Point } from "../../engine/point"
import { TileSource } from "../../engine/tiles/TileSource"
import { Collider } from "../../engine/collision/Collider"

export class Item {
    readonly displayName: string
    readonly droppedIconSupplier: () => TileSource
    readonly inventoryIconSupplier: () => TileSource
    readonly stackLimit: number

    constructor(
        displayName: string,
        droppedIconSupplier: () => TileSource,
        inventoryIconSupplier: () => TileSource,
        stackLimit: number = Number.MAX_SAFE_INTEGER
    ) {
        this.displayName = displayName
        this.droppedIconSupplier = droppedIconSupplier
        this.inventoryIconSupplier = inventoryIconSupplier
        this.stackLimit = stackLimit
    }
}

export const Items = {
    COIN: new Item(
        "Coin",
        () => Tilesets.instance.dungeonCharacters.getTileSetAnimation("coin_anim", 150),
        () => Tilesets.instance.oneBit.getTileSource("coin"),
    ),
    ROCK: new Item(
        "Rock",
        () => Tilesets.instance.outdoorTiles.getTileSource("rockItem"),
        () => Tilesets.instance.oneBit.getTileSource("rock"), 
        100
    ),
    WOOD: new Item(
        "Wood",
        () => Tilesets.instance.outdoorTiles.getTileSource("woodItem"),
        () => Tilesets.instance.oneBit.getTileSource("wood"), 
        100
    )
}

/**
 * @param position The bottom center where the item should be placed
 * 
 * TODO: Add initial velocity
 */
export const spawnItem = (pos: Point, item: Item, velocity: Point = new Point(0, 0), sourceCollider: Collider = null) => {
    LocationManager.instance.currentLocation.droppedItems.add(new Entity([new DroppedItem(pos, item, velocity, sourceCollider)]))
}