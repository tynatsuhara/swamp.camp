import { Entity, Point } from "brigsby/dist"
import { Collider } from "brigsby/dist/collision"
import { SpriteSource, StaticSpriteSource } from "brigsby/dist/sprites"
import { loadAudio } from "../audio/DeferLoadAudio"
import { Sounds } from "../audio/Sounds"
import { Condition } from "../characters/Condition"
import { Player } from "../characters/Player"
import { ShieldType } from "../characters/weapons/ShieldType"
import { WeaponType } from "../characters/weapons/WeaponType"
import { Tilesets } from "../graphics/Tilesets"
import { ElementType } from "../world/elements/Elements"
import { here } from "../world/locations/LocationManager"
import { DroppedItem } from "./DroppedItem"

export enum Item {
    COIN,
    ROCK,
    WOOD,
    TENT,
    CAMPFIRE,
    IRON,
    HOUSE,
    ROUND_SAPLING,
    POINTY_SAPLING,
    MUSHROOM,
    CHEST,
    BED,
    MINE_ENTRANCE,
    CHURCH,
    WEAK_MEDICINE,
    HEART_CONTAINER,
    APOTHECARY,
    POISON_ANTIDOTE,
    MEAT,
    BLACKBERRIES,
    SMALL_CABIN,

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
    TORCH,
}

window["Item"] = Item

type Consumable = { verb: string; fn: () => void }

// Items of the same type can have different metadata
// eg enchantments on weapons, owners of items, etc.
// Currently, metadata only applies to non-stackable items
export type ItemMetadata = Record<string, any>

export class ItemSpec {
    readonly displayName: string
    readonly droppedIconSupplier?: () => SpriteSource
    readonly inventoryIconSupplier: () => StaticSpriteSource
    readonly stackLimit: number
    readonly element?: ElementType
    readonly equippableWeapon?: WeaponType
    readonly equippableShield?: ShieldType
    readonly consumable?: Consumable

    constructor({
        displayName,
        inventoryIconSupplier,
        droppedIconSupplier = () => null,
        stackLimit = 99,
        element = null, // for placing elements
        equippableWeapon = null,
        equippableShield = null,
        consumable = null,
    }: {
        displayName: string
        inventoryIconSupplier: () => StaticSpriteSource
        droppedIconSupplier?: () => SpriteSource
        stackLimit?: number
        element?: ElementType
        equippableWeapon?: WeaponType
        equippableShield?: ShieldType
        consumable?: Consumable
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

const SOUNDS: { [key: string]: [string, number] } = {
    drink: ["/audio/rpg/inventory/bottle.wav", 0.2],
    eat: ["/audio/rpg/NPC/beetle/bite-small.wav", 0.3],
}
loadAudio(Object.values(SOUNDS).map((s) => s[0]))

export const ITEM_METADATA_MAP = {
    [Item.COIN]: new ItemSpec({
        displayName: "Coin",
        inventoryIconSupplier: () => Tilesets.instance.oneBit.getTileSource("coin"),
        droppedIconSupplier: () =>
            Tilesets.instance.dungeonCharacters.getTileSetAnimation("coin_anim", 150),
        stackLimit: Number.MAX_SAFE_INTEGER,
    }),
    [Item.ROCK]: new ItemSpec({
        displayName: "Rock",
        inventoryIconSupplier: () => Tilesets.instance.oneBit.getTileSource("rock"),
        droppedIconSupplier: () => Tilesets.instance.outdoorTiles.getTileSource("rockItem"),
    }),
    [Item.WOOD]: new ItemSpec({
        displayName: "Wood",
        inventoryIconSupplier: () => Tilesets.instance.oneBit.getTileSource("wood"),
        droppedIconSupplier: () => Tilesets.instance.outdoorTiles.getTileSource("woodItem"),
    }),
    [Item.CAMPFIRE]: new ItemSpec({
        displayName: "Campfire",
        inventoryIconSupplier: () => Tilesets.instance.oneBit.getTileSource("campfire"),
        stackLimit: 1,
        element: ElementType.CAMPFIRE,
    }),
    [Item.IRON]: new ItemSpec({
        displayName: "Iron",
        inventoryIconSupplier: () => Tilesets.instance.oneBit.getTileSource("iron"),
        droppedIconSupplier: () => Tilesets.instance.outdoorTiles.getTileSource("ironItem"),
    }),
    [Item.ROUND_SAPLING]: new ItemSpec({
        displayName: "Sapling",
        inventoryIconSupplier: () => Tilesets.instance.oneBit.getTileSource("treeRound"),
        droppedIconSupplier: () => Tilesets.instance.outdoorTiles.getTileSource("treeRoundSapling"),
        element: ElementType.TREE_ROUND,
    }),
    [Item.POINTY_SAPLING]: new ItemSpec({
        displayName: "Sapling",
        inventoryIconSupplier: () => Tilesets.instance.oneBit.getTileSource("treePointy"),
        droppedIconSupplier: () =>
            Tilesets.instance.outdoorTiles.getTileSource("treePointySapling"),
        element: ElementType.TREE_POINTY,
    }),
    [Item.MUSHROOM]: new ItemSpec({
        displayName: "Mushroom",
        inventoryIconSupplier: () => Tilesets.instance.oneBit.getTileSource("mushroom"),
        droppedIconSupplier: () => Tilesets.instance.outdoorTiles.getTileSource("mushroom"),
        element: ElementType.MUSHROOM,
        consumable: {
            verb: "eat",
            fn: () => {
                Player.instance.dude.heal(1)
                Sounds.play(...SOUNDS.eat)
                if (Math.random() < 0.25) {
                    Player.instance.dude.addCondition(
                        Condition.POISONED,
                        2_500 + Math.random() * 5_000
                    )
                }
            },
        },
    }),
    [Item.CHEST]: new ItemSpec({
        displayName: "Chest",
        inventoryIconSupplier: () => Tilesets.instance.oneBit.getTileSource("chest"),
        stackLimit: 1,
        element: ElementType.CHEST,
    }),
    [Item.BED]: new ItemSpec({
        displayName: "Bed",
        inventoryIconSupplier: () => Tilesets.instance.oneBit.getTileSource("bed"),
        stackLimit: 1,
        element: ElementType.BED,
    }),
    [Item.WEAK_MEDICINE]: new ItemSpec({
        displayName: "Weak medicine",
        inventoryIconSupplier: () => Tilesets.instance.oneBit.getTileSource("potion1"),
        stackLimit: 1,
        consumable: {
            verb: "drink",
            fn: () => {
                Player.instance.dude.addCondition(Condition.HEALING, 10_000)
                Sounds.play(...SOUNDS.drink)
            },
        },
    }),
    [Item.HEART_CONTAINER]: new ItemSpec({
        displayName: "Heart container",
        inventoryIconSupplier: () => Tilesets.instance.oneBit.getTileSource("heart"),
        stackLimit: 1,
    }),
    [Item.POISON_ANTIDOTE]: new ItemSpec({
        displayName: "Antidote",
        inventoryIconSupplier: () => Tilesets.instance.oneBit.getTileSource("potion3"),
        stackLimit: 1,
        consumable: {
            verb: "drink",
            fn: () => {
                Player.instance.dude.removeCondition(Condition.POISONED)
                Sounds.play(...SOUNDS.drink)
            },
        },
    }),
    [Item.MEAT]: new ItemSpec({
        displayName: "Meat",
        inventoryIconSupplier: () => Tilesets.instance.oneBit.getTileSource("meat1"),
        consumable: {
            verb: "eat",
            fn: () => {
                Player.instance.dude.heal(1)
                Sounds.play(...SOUNDS.eat)
            },
        },
        droppedIconSupplier: () => Tilesets.instance.outdoorTiles.getTileSource("meat1"),
    }),
    [Item.BLACKBERRIES]: new ItemSpec({
        displayName: "Berries",
        inventoryIconSupplier: () => Tilesets.instance.oneBit.getTileSource("berries"),
        consumable: {
            verb: "eat",
            fn: () => {
                Player.instance.dude.heal(0.25), Sounds.play(...SOUNDS.eat)
            },
        },
        droppedIconSupplier: () => Tilesets.instance.outdoorTiles.getTileSource("berries"),
    }),

    // Locations
    [Item.TENT]: new ItemSpec({
        displayName: "Tent",
        inventoryIconSupplier: () => Tilesets.instance.oneBit.getTileSource("tent"),
        stackLimit: 1,
        element: ElementType.TENT,
        droppedIconSupplier: () => Tilesets.instance.outdoorTiles.getTileSource("tentdropped"),
    }),
    [Item.HOUSE]: new ItemSpec({
        displayName: "House",
        inventoryIconSupplier: () => Tilesets.instance.oneBit.getTileSource("house"),
        stackLimit: 1,
        element: ElementType.HOUSE,
    }),
    [Item.SMALL_CABIN]: new ItemSpec({
        displayName: "Small cabin",
        inventoryIconSupplier: () => Tilesets.instance.oneBit.getTileSource("cabin"),
        stackLimit: 1,
        element: ElementType.CABIN,
    }),
    [Item.APOTHECARY]: new ItemSpec({
        displayName: "Apothecary",
        inventoryIconSupplier: () => Tilesets.instance.oneBit.getTileSource("house"),
        stackLimit: 1,
        element: ElementType.APOTHECARY,
    }),
    [Item.CHURCH]: new ItemSpec({
        displayName: "Church",
        inventoryIconSupplier: () => Tilesets.instance.oneBit.getTileSource("church"),
        stackLimit: 1,
        element: ElementType.CHURCH,
    }),
    // TODO
    [Item.MINE_ENTRANCE]: new ItemSpec({
        displayName: "Mine entrance",
        inventoryIconSupplier: () => Tilesets.instance.oneBit.getTileSource("ladder"),
        stackLimit: 1,
        element: ElementType.MINE_ENTRANCE,
    }),

    // Weapons
    [Item.AXE]: new ItemSpec({
        displayName: "Axe",
        inventoryIconSupplier: () => Tilesets.instance.oneBit.getTileSource("axe"),
        stackLimit: 1,
        equippableWeapon: WeaponType.AXE,
    }),
    [Item.PICKAXE]: new ItemSpec({
        displayName: "Pickaxe",
        inventoryIconSupplier: () => Tilesets.instance.oneBit.getTileSource("pickaxe"),
        stackLimit: 1,
        equippableWeapon: WeaponType.PICKAXE,
    }),
    [Item.SWORD]: new ItemSpec({
        displayName: "Sword",
        inventoryIconSupplier: () => Tilesets.instance.oneBit.getTileSource("sword"),
        stackLimit: 1,
        equippableWeapon: WeaponType.SWORD,
    }),
    [Item.SPEAR]: new ItemSpec({
        displayName: "Spear",
        inventoryIconSupplier: () => Tilesets.instance.oneBit.getTileSource("spear"),
        stackLimit: 1,
        equippableWeapon: WeaponType.SPEAR,
    }),

    // Shields
    [Item.BASIC_SHIELD]: new ItemSpec({
        displayName: "Shield",
        inventoryIconSupplier: () => Tilesets.instance.oneBit.getTileSource("shield0"),
        stackLimit: 1,
        equippableShield: ShieldType.BASIC,
    }),
    [Item.LANTERN]: new ItemSpec({
        displayName: "Lantern",
        inventoryIconSupplier: () => Tilesets.instance.oneBit.getTileSource("lantern"),
        stackLimit: 1,
        equippableShield: ShieldType.LANTERN,
    }),
}

/**
 * @param position The bottom center where the item should be placed
 */
export const spawnItem = ({
    pos,
    item,
    velocity = new Point(0, 0),
    sourceCollider,
    metadata = {},
}: {
    pos: Point
    item: Item
    velocity?: Point
    sourceCollider?: Collider
    metadata?: ItemMetadata
}) => {
    here().droppedItems.add(
        new Entity([new DroppedItem(pos, item, velocity, sourceCollider, metadata)])
    )
}
