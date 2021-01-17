import { Tilesets } from "../graphics/Tilesets"
import { Entity } from "../../engine/Entity"
import { LocationManager } from "../world/LocationManager"
import { DroppedItem } from "./DroppedItem"
import { Point } from "../../engine/point"
import { TileSource } from "../../engine/tiles/TileSource"
import { Collider } from "../../engine/collision/Collider"
import { ElementType } from "../world/elements/Elements"
import { StaticTileSource } from "../../engine/tiles/StaticTileSource"
import { WeaponType } from "../characters/weapons/WeaponType"
import { Player } from "../characters/Player"

export class ItemMetadata {
    readonly displayName: string
    readonly droppedIconSupplier: () => TileSource
    readonly inventoryIconSupplier: () => StaticTileSource
    readonly stackLimit: number
    readonly element: ElementType
    readonly equippable: WeaponType
    readonly consumable: () => void

    // TODO maybe make this a builder
    constructor({
        displayName,
        inventoryIconSupplier,
        droppedIconSupplier = () => null,
        stackLimit = 99,
        element = null,  // for placing elements
        equippable = null,
        consumable = null,
    }: {
        displayName: string,
        inventoryIconSupplier: () => StaticTileSource,
        droppedIconSupplier?: () => TileSource,
        stackLimit?: number,
        element?: ElementType,
        equippable?: WeaponType,
        consumable?: () => void,
    }) {
        this.displayName = displayName
        this.droppedIconSupplier = droppedIconSupplier
        this.inventoryIconSupplier = inventoryIconSupplier
        this.stackLimit = stackLimit
        this.element = element
        this.equippable = equippable
        this.consumable = consumable
    }
}

export const enum Item {
    COIN, ROCK, WOOD, TENT, CAMPFIRE, IRON, HOUSE, ROUND_SAPLING, POINTY_SAPLING, MUSHROOM,

    // weapon values should match the WeaponType enum so we can cast them
    KNIFE = WeaponType.KNIFE, 
    SHITTY_SWORD,
    SWORD,
    FANCY_SWORD,
    BIG_HAMMER,
    HAMMER,
    CLUB,
    MACE,
    KATANA,
    SERRATED_SWORD,
    BIG_SWORD,
    AXE,
    MACHETE,
    CLEAVER,
    FENCING_SWORD,
    GREATSWORD,
    GOLD_SWORD,
    BIG_GOLD_SWORD,
    STAFF_1,
    STAFF_2,
    SPEAR,
    PICKAXE,
}

// Data that doesn't get serialized (TODO make builder pattern)
export const ITEM_METADATA_MAP = {
    [Item.COIN]: new ItemMetadata({
        displayName: "Coin",
        inventoryIconSupplier: () => Tilesets.instance.oneBit.getTileSource("coin"),
        droppedIconSupplier: () => Tilesets.instance.dungeonCharacters.getTileSetAnimation("coin_anim", 150),
        stackLimit: Number.MAX_SAFE_INTEGER,
    }),
    [Item.ROCK]: new ItemMetadata({
        displayName: "Rock",
        inventoryIconSupplier: () => Tilesets.instance.oneBit.getTileSource("rock"), 
        droppedIconSupplier: () => Tilesets.instance.outdoorTiles.getTileSource("rockItem"),
    }),
    [Item.WOOD]: new ItemMetadata({
        displayName: "Wood",
        inventoryIconSupplier: () => Tilesets.instance.oneBit.getTileSource("wood"), 
        droppedIconSupplier: () => Tilesets.instance.outdoorTiles.getTileSource("woodItem"),
    }),
    [Item.TENT]: new ItemMetadata({
        displayName: "Tent",
        inventoryIconSupplier: () => Tilesets.instance.oneBit.getTileSource("tent"), 
        stackLimit: 1,
        element: ElementType.TENT
    }),
    [Item.CAMPFIRE]: new ItemMetadata({
        displayName: "Campfire",
        inventoryIconSupplier: () => Tilesets.instance.oneBit.getTileSource("campfire"), 
        stackLimit: 1,
        element: ElementType.CAMPFIRE
    }),
    [Item.IRON]: new ItemMetadata({
        displayName: "Iron",
        inventoryIconSupplier: () => Tilesets.instance.oneBit.getTileSource("iron"), 
        droppedIconSupplier: () => Tilesets.instance.outdoorTiles.getTileSource("ironItem"),
    }),
    [Item.HOUSE]: new ItemMetadata({
        displayName: "House",
        inventoryIconSupplier: () => Tilesets.instance.oneBit.getTileSource("house"),
        stackLimit: 1,
        element: ElementType.HOUSE
    }),
    [Item.ROUND_SAPLING]: new ItemMetadata({
        displayName: "Sapling",
        inventoryIconSupplier: () => Tilesets.instance.oneBit.getTileSource("treeRound"), 
        droppedIconSupplier: () => Tilesets.instance.outdoorTiles.getTileSource("treeRoundSapling"),
        element: ElementType.TREE_ROUND
    }),
    [Item.POINTY_SAPLING]: new ItemMetadata({
        displayName: "Sapling",
        inventoryIconSupplier: () => Tilesets.instance.oneBit.getTileSource("treePointy"), 
        droppedIconSupplier: () => Tilesets.instance.outdoorTiles.getTileSource("treePointySapling"),
        element: ElementType.TREE_POINTY
    }),
    [Item.MUSHROOM]: new ItemMetadata({
        displayName: "Mushroom",
        inventoryIconSupplier: () => Tilesets.instance.oneBit.getTileSource("mushroom"), 
        droppedIconSupplier: () => Tilesets.instance.outdoorTiles.getTileSource("mushroom"),
        // element: ElementType.TREE_POINTY  // TODO make placeable
        consumable: () => Player.instance.dude.heal(1)
    }),
    // TODO add other weapons
    [Item.AXE]: new ItemMetadata({
        displayName: "Axe",
        inventoryIconSupplier: () => Tilesets.instance.oneBit.getTileSource("axe"), 
        stackLimit: 1,
        equippable: WeaponType.AXE
    }),
    [Item.PICKAXE]: new ItemMetadata({
        displayName: "Pickaxe",
        inventoryIconSupplier: () => Tilesets.instance.oneBit.getTileSource("pickaxe"), 
        stackLimit: 1,
        equippable: WeaponType.PICKAXE
    }),
    [Item.SWORD]: new ItemMetadata({
        displayName: "Sword",
        inventoryIconSupplier: () => Tilesets.instance.oneBit.getTileSource("sword"), 
        stackLimit: 1,
        equippable: WeaponType.SWORD
    }),
    [Item.SPEAR]: new ItemMetadata({
        displayName: "Spear",
        inventoryIconSupplier: () => Tilesets.instance.oneBit.getTileSource("spear"), 
        stackLimit: 1,
        equippable: WeaponType.SPEAR
    }),
}

/**
 * @param position The bottom center where the item should be placed
 */
export const spawnItem = (pos: Point, item: Item, velocity: Point = new Point(0, 0), sourceCollider: Collider = null) => {
    LocationManager.instance.currentLocation.droppedItems.add(new Entity([
        new DroppedItem(pos, item, velocity, sourceCollider)
    ]))
}