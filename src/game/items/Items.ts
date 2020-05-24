import { Tilesets } from "../graphics/Tilesets"
import { Entity } from "../../engine/Entity"
import { LocationManager } from "../world/LocationManager"
import { DroppedItem } from "./DroppedItem"
import { Point } from "../../engine/point"
import { TileSource } from "../../engine/tiles/TileSource"
import { Collider } from "../../engine/collision/Collider"
import { ElementType, Elements } from "../world/elements/Elements"

export class ItemMetadata {
    readonly displayName: string
    readonly droppedIconSupplier: () => TileSource
    readonly inventoryIconSupplier: () => TileSource
    readonly stackLimit: number
    readonly element: ElementType

    // TODO maybe make this a builder
    constructor(
        displayName: string,
        droppedIconSupplier: () => TileSource,
        inventoryIconSupplier: () => TileSource,
        stackLimit: number = Number.MAX_SAFE_INTEGER,
        element: ElementType = null,  // for placing elements
    ) {
        this.displayName = displayName
        this.droppedIconSupplier = droppedIconSupplier
        this.inventoryIconSupplier = inventoryIconSupplier
        this.stackLimit = stackLimit
        this.element = element
    }
}

export const enum Item {
    COIN,
    ROCK,
    WOOD,
    TENT,
    CAMPFIRE,
}

// Data that doesn't get serialized (TODO make builder pattern)
export const ITEM_METADATA_MAP = {
    [Item.COIN]: new ItemMetadata(
        "Coin",
        () => Tilesets.instance.dungeonCharacters.getTileSetAnimation("coin_anim", 150),
        () => Tilesets.instance.oneBit.getTileSource("coin"),
    ),
    [Item.ROCK]: new ItemMetadata(
        "Rock",
        () => Tilesets.instance.outdoorTiles.getTileSource("rockItem"),
        () => Tilesets.instance.oneBit.getTileSource("rock"), 
        100
    ),
    [Item.WOOD]: new ItemMetadata(
        "Wood",
        () => Tilesets.instance.outdoorTiles.getTileSource("woodItem"),
        () => Tilesets.instance.oneBit.getTileSource("wood"), 
        100
    ),
    [Item.TENT]: new ItemMetadata(
        "Tent",
        () => null,
        () => Tilesets.instance.oneBit.getTileSource("tent"), 
        1,
        ElementType.TENT
    ),
    [Item.CAMPFIRE]: new ItemMetadata(
        "Campfire",
        () => null,
        () => Tilesets.instance.oneBit.getTileSource("campfire"), 
        1,
        ElementType.CAMPFIRE
    ),
}

/**
 * @param position The bottom center where the item should be placed
 * 
 * TODO: Add initial velocity
 */
export const spawnItem = (pos: Point, item: Item, velocity: Point = new Point(0, 0), sourceCollider: Collider = null) => {
    LocationManager.instance.currentLocation.droppedItems.add(new Entity([
        new DroppedItem(pos, item, velocity, sourceCollider)
    ]))
}