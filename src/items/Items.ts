import { Tilesets } from "../graphics/Tilesets"
import { Entity } from "brigsby/dist/Entity"
import { LocationManager } from "../world/LocationManager"
import { DroppedItem } from "./DroppedItem"
import { Point } from "brigsby/dist/Point"
import { SpriteSource } from "brigsby/dist/sprites/SpriteSource"
import { Collider } from "brigsby/dist/collision/Collider"
import { ElementType } from "../world/elements/Elements"
import { StaticSpriteSource } from "brigsby/dist/sprites/StaticSpriteSource"
import { WeaponType } from "../characters/weapons/WeaponType"
import { Player } from "../characters/Player"
import { ShieldType } from "../characters/weapons/ShieldType"

export class ItemMetadata {
    readonly displayName: string
    readonly droppedIconSupplier: () => SpriteSource
    readonly inventoryIconSupplier: () => StaticSpriteSource
    readonly stackLimit: number
    readonly element: ElementType
    readonly equippableWeapon: WeaponType
    readonly equippableShield: ShieldType
    readonly consumable: () => void

    // TODO maybe make this a builder
    constructor({
        displayName,
        inventoryIconSupplier,
        droppedIconSupplier = () => null,
        stackLimit = 99,
        element = null,  // for placing elements
        equippableWeapon = null,
        equippableShield = null,
        consumable = null,
    }: {
        displayName: string,
        inventoryIconSupplier: () => StaticSpriteSource,
        droppedIconSupplier?: () => SpriteSource,
        stackLimit?: number,
        element?: ElementType,
        equippableWeapon?: WeaponType,
        equippableShield?: ShieldType
        consumable?: () => void,
    }) {
        this.displayName = displayName
        this.droppedIconSupplier = droppedIconSupplier
        this.inventoryIconSupplier = inventoryIconSupplier
        this.stackLimit = stackLimit
        this.element = element
        this.equippableWeapon = equippableWeapon
        this.equippableShield = equippableShield
        this.consumable = consumable
    }
}

export enum Item {
    COIN, ROCK, WOOD, TENT, CAMPFIRE, IRON, HOUSE, ROUND_SAPLING, POINTY_SAPLING, MUSHROOM, CHEST, BED, MINE_ENTRANCE,

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

    // shield values should match the ShieldType enum so we can cast them
    BASIC_SHIELD = ShieldType.BASIC,
    LANTERN,
}

window["Item"] = Item

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
        element: ElementType.MUSHROOM,
        consumable: () => Player.instance.dude.heal(1)
    }),
    [Item.CHEST]: new ItemMetadata({
        displayName: "Chest",
        inventoryIconSupplier: () => Tilesets.instance.oneBit.getTileSource("chest"), 
        stackLimit: 1,
        element: ElementType.CHEST
    }),
    [Item.BED]: new ItemMetadata({
        displayName: "Bed",
        inventoryIconSupplier: () => Tilesets.instance.oneBit.getTileSource("bed"), 
        stackLimit: 1,
        element: ElementType.BED
    }),

    // Locations
    [Item.TENT]: new ItemMetadata({
        displayName: "Tent",
        inventoryIconSupplier: () => Tilesets.instance.oneBit.getTileSource("tent"), 
        stackLimit: 1,
        element: ElementType.TENT
    }),
    [Item.HOUSE]: new ItemMetadata({
        displayName: "House",
        inventoryIconSupplier: () => Tilesets.instance.oneBit.getTileSource("house"),
        stackLimit: 1,
        element: ElementType.HOUSE
    }),
    // TODO
    [Item.MINE_ENTRANCE]: new ItemMetadata({
        displayName: "Mine Entrance",
        inventoryIconSupplier: () => Tilesets.instance.oneBit.getTileSource("ladder"),
        stackLimit: 1,
        element: ElementType.MINE_ENTRANCE
    }),

    // Weapons
    [Item.AXE]: new ItemMetadata({
        displayName: "Axe",
        inventoryIconSupplier: () => Tilesets.instance.oneBit.getTileSource("axe"), 
        stackLimit: 1,
        equippableWeapon: WeaponType.AXE
    }),
    [Item.PICKAXE]: new ItemMetadata({
        displayName: "Pickaxe",
        inventoryIconSupplier: () => Tilesets.instance.oneBit.getTileSource("pickaxe"), 
        stackLimit: 1,
        equippableWeapon: WeaponType.PICKAXE
    }),
    [Item.SWORD]: new ItemMetadata({
        displayName: "Sword",
        inventoryIconSupplier: () => Tilesets.instance.oneBit.getTileSource("sword"), 
        stackLimit: 1,
        equippableWeapon: WeaponType.SWORD
    }),
    [Item.SPEAR]: new ItemMetadata({
        displayName: "Spear",
        inventoryIconSupplier: () => Tilesets.instance.oneBit.getTileSource("spear"), 
        stackLimit: 1,
        equippableWeapon: WeaponType.SPEAR
    }),

    // Shields
    [Item.BASIC_SHIELD]: new ItemMetadata({
        displayName: "Shield",
        inventoryIconSupplier: () => Tilesets.instance.oneBit.getTileSource("shield0"), 
        stackLimit: 1,
        equippableShield: ShieldType.BASIC
    }),
    [Item.LANTERN]: new ItemMetadata({
        displayName: "Lantern",
        inventoryIconSupplier: () => Tilesets.instance.oneBit.getTileSource("lantern"), 
        stackLimit: 1,
        equippableShield: ShieldType.LANTERN
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