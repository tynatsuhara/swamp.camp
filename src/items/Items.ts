import { expose, Point } from "brigsby/dist"
import { Collider } from "brigsby/dist/collision"
import { PointValue, pt } from "brigsby/dist/Point"
import { SpriteSource } from "brigsby/dist/sprites"
import { loadAudio } from "../audio/DeferLoadAudio"
import { Condition } from "../characters/Condition"
import { Dude } from "../characters/Dude"
import { ShieldType } from "../characters/weapons/ShieldType"
import { WeaponType } from "../characters/weapons/WeaponType"
import { Icon } from "../graphics/OneBitTileset"
import { Tilesets } from "../graphics/Tilesets"
import { session } from "../online/session"
import { syncFn } from "../online/syncUtils"
import { randomByteString } from "../saves/uuid"
import { Color } from "../ui/Color"
import { getIconSprite } from "../ui/IconSprite"
import { ElementType } from "../world/elements/Elements"
import { here } from "../world/locations/LocationManager"
import { DroppedItem } from "./DroppedItem"
import { ItemUtils } from "./ItemUtils"
import { getTentVariantImageFilter } from "./TentVariants"

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
    RAW_MEAT,
    BLACKBERRIES,
    SMALL_CABIN,
    COOKED_MEAT,
    EXPLORER_MAP,

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

expose({ Item })

// stack limits for consistency
const STACK_LG = 99
const STACK_SM = 5

type Consumable = { verb: string; fn: (consumer: Dude) => void }

// Items of the same type can have different metadata
// eg enchantments on weapons, owners of items, etc.
// These should be serializable primitives!
export type ItemMetadata = Record<string, any>

export class ItemSpec {
    readonly displayName: string
    readonly droppedIconSupplier?: (metadata?: ItemMetadata) => SpriteSource
    readonly inventoryIcon: Icon
    readonly stackLimit: number
    readonly element?: ElementType
    readonly equippableWeapon?: WeaponType
    readonly equippableShield?: ShieldType
    readonly consumable?: Consumable

    constructor({
        displayName,
        inventoryIcon,
        droppedIconSupplier = () => null,
        stackLimit = STACK_LG,
        element = null, // for placing elements
        equippableWeapon = null,
        equippableShield = null,
        consumable = null,
    }: {
        displayName: string
        inventoryIcon: Icon
        droppedIconSupplier?: (metadata?: ItemMetadata) => SpriteSource
        stackLimit?: number
        element?: ElementType
        equippableWeapon?: WeaponType
        equippableShield?: ShieldType
        consumable?: Consumable
    }) {
        this.displayName = displayName
        this.droppedIconSupplier = droppedIconSupplier
        this.inventoryIcon = inventoryIcon
        this.stackLimit = stackLimit
        this.element = element
        this.equippableWeapon = equippableWeapon
        this.equippableShield = equippableShield
        this.consumable = consumable
    }

    inventoryIconSupplier(color: Color = Color.WHITE) {
        return getIconSprite({ icon: this.inventoryIcon, color })
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
        inventoryIcon: "coin",
        droppedIconSupplier: () =>
            Tilesets.instance.dungeonCharacters.getTileSetAnimation("coin_anim", 150),
        stackLimit: Number.MAX_SAFE_INTEGER,
    }),
    [Item.ROCK]: new ItemSpec({
        displayName: "Rock",
        inventoryIcon: "rock",
        droppedIconSupplier: () => Tilesets.instance.outdoorTiles.getTileSource("rockItem"),
    }),
    [Item.WOOD]: new ItemSpec({
        displayName: "Wood",
        inventoryIcon: "wood",
        droppedIconSupplier: () => Tilesets.instance.outdoorTiles.getTileSource("woodItem"),
    }),
    [Item.CAMPFIRE]: new ItemSpec({
        displayName: "Campfire",
        inventoryIcon: "campfire",
        stackLimit: 1,
        element: ElementType.CAMPFIRE,
    }),
    [Item.IRON]: new ItemSpec({
        displayName: "Iron",
        inventoryIcon: "iron",
        droppedIconSupplier: () => Tilesets.instance.outdoorTiles.getTileSource("ironItem"),
    }),
    [Item.ROUND_SAPLING]: new ItemSpec({
        displayName: "Sapling",
        inventoryIcon: "treeRound",
        droppedIconSupplier: () => Tilesets.instance.outdoorTiles.getTileSource("treeRoundSapling"),
        element: ElementType.TREE_ROUND,
    }),
    [Item.POINTY_SAPLING]: new ItemSpec({
        displayName: "Sapling",
        inventoryIcon: "treePointy",
        droppedIconSupplier: () =>
            Tilesets.instance.outdoorTiles.getTileSource("treePointySapling"),
        element: ElementType.TREE_POINTY,
    }),
    [Item.MUSHROOM]: new ItemSpec({
        displayName: "Mushroom",
        inventoryIcon: "mushroom",
        droppedIconSupplier: () => Tilesets.instance.outdoorTiles.getTileSource("mushroom"),
        element: ElementType.MUSHROOM,
        consumable: ItemUtils.consumable("eat", SOUNDS.eat, (consumer) => {
            consumer.heal(1)
            if (Math.random() < 0.25) {
                consumer.addCondition(Condition.POISONED, 2_500 + Math.random() * 5_000)
            }
        }),
    }),
    [Item.CHEST]: new ItemSpec({
        displayName: "Chest",
        inventoryIcon: "chest",
        stackLimit: 1,
        element: ElementType.CHEST,
    }),
    [Item.BED]: new ItemSpec({
        displayName: "Bed",
        inventoryIcon: "bed",
        stackLimit: 1,
        element: ElementType.BED,
    }),
    [Item.WEAK_MEDICINE]: new ItemSpec({
        displayName: "Weak medicine",
        inventoryIcon: "potion1",
        stackLimit: STACK_SM,
        consumable: ItemUtils.consumable("drink", SOUNDS.drink, (consumer) =>
            consumer.addCondition(Condition.HEALING, 10_000)
        ),
    }),
    [Item.HEART_CONTAINER]: new ItemSpec({
        displayName: "Heart container",
        inventoryIcon: "heart",
        stackLimit: 1,
    }),
    [Item.POISON_ANTIDOTE]: new ItemSpec({
        displayName: "Antidote",
        inventoryIcon: "potion3",
        stackLimit: STACK_SM,
        consumable: ItemUtils.consumable("drink", SOUNDS.drink, (consumer) =>
            consumer.removeCondition(Condition.POISONED)
        ),
    }),
    [Item.RAW_MEAT]: new ItemSpec({
        displayName: "Raw meat",
        inventoryIcon: "meat1raw",
        consumable: ItemUtils.consumable("eat", SOUNDS.eat, (consumer) => {
            consumer.heal(0.5)
            if (Math.random() < 0.2) {
                consumer.addCondition(Condition.POISONED, 1_000)
            }
        }),
        droppedIconSupplier: () => Tilesets.instance.outdoorTiles.getTileSource("meat1"),
    }),
    [Item.COOKED_MEAT]: new ItemSpec({
        displayName: "Cooked meat",
        inventoryIcon: "meat1",
        consumable: ItemUtils.consumable("eat", SOUNDS.eat, (consumer) => consumer.heal(2)),
    }),
    [Item.BLACKBERRIES]: new ItemSpec({
        displayName: "Berries",
        inventoryIcon: "berries",
        consumable: ItemUtils.consumable("eat", SOUNDS.eat, (consumer) => consumer.heal(0.5)),
        droppedIconSupplier: () => Tilesets.instance.outdoorTiles.getTileSource("berries"),
    }),
    [Item.EXPLORER_MAP]: new ItemSpec({
        displayName: "Explorer's map",
        inventoryIcon: "map",
        stackLimit: 1,
    }),

    // Locations
    [Item.TENT]: new ItemSpec({
        displayName: "Tent",
        inventoryIcon: "tent",
        stackLimit: 1,
        element: ElementType.TENT,
        droppedIconSupplier: (metadata) =>
            Tilesets.instance.outdoorTiles
                .getTileSource("tentdropped")
                .filtered(getTentVariantImageFilter(metadata.color)),
    }),
    [Item.HOUSE]: new ItemSpec({
        displayName: "House",
        inventoryIcon: "house",
        stackLimit: 1,
        element: ElementType.HOUSE,
    }),
    [Item.SMALL_CABIN]: new ItemSpec({
        displayName: "Small cabin",
        inventoryIcon: "cabin",
        stackLimit: 1,
        element: ElementType.CABIN,
    }),
    [Item.APOTHECARY]: new ItemSpec({
        displayName: "Apothecary",
        inventoryIcon: "house",
        stackLimit: 1,
        element: ElementType.APOTHECARY,
    }),
    [Item.CHURCH]: new ItemSpec({
        displayName: "Church",
        inventoryIcon: "church",
        stackLimit: 1,
        element: ElementType.CHURCH,
    }),
    [Item.MINE_ENTRANCE]: new ItemSpec({
        displayName: "Mine entrance",
        inventoryIcon: "ladder",
        stackLimit: 1,
        element: ElementType.MINE_ENTRANCE,
    }),

    // Weapons
    [Item.AXE]: new ItemSpec({
        displayName: "Axe",
        inventoryIcon: "axe",
        stackLimit: 1,
        equippableWeapon: WeaponType.AXE,
    }),
    [Item.PICKAXE]: new ItemSpec({
        displayName: "Pickaxe",
        inventoryIcon: "pickaxe",
        stackLimit: 1,
        equippableWeapon: WeaponType.PICKAXE,
    }),
    [Item.SWORD]: new ItemSpec({
        displayName: "Sword",
        inventoryIcon: "sword",
        stackLimit: 1,
        equippableWeapon: WeaponType.SWORD,
    }),
    [Item.SPEAR]: new ItemSpec({
        displayName: "Spear",
        inventoryIcon: "spear",
        stackLimit: 1,
        equippableWeapon: WeaponType.SPEAR,
    }),

    // Shields
    [Item.BASIC_SHIELD]: new ItemSpec({
        displayName: "Shield",
        inventoryIcon: "shield0",
        stackLimit: 1,
        equippableShield: ShieldType.BASIC,
    }),
    [Item.LANTERN]: new ItemSpec({
        displayName: "Lantern",
        inventoryIcon: "lantern",
        stackLimit: 1,
        equippableShield: ShieldType.LANTERN,
        element: ElementType.PLACED_LANTERN,
    }),
}

type SpawnItemArgs = {
    pos: PointValue
    item: Item
    velocity?: PointValue
    metadata?: ItemMetadata
}

/**
 * @param position The bottom center where the item should be placed
 */
export const spawnItem = ({
    pos,
    item,
    velocity = new Point(0, 0),
    metadata,
    sourceCollider,
}: SpawnItemArgs & { sourceCollider?: Collider }) => {
    if (session.isGuest()) {
        console.warn("guests can't call spawnItem()")
        return
    }

    const id = randomByteString()

    syncSpawnedItem({ id, pos, item, velocity, metadata })
    here().addDroppedItem(
        new DroppedItem(
            id,
            pt(pos.x, pos.y),
            item,
            pt(velocity.x, velocity.y),
            metadata,
            sourceCollider
        )
    )
}

const syncSpawnedItem = syncFn(
    "spawnItem",
    ({ id, pos, item, velocity, metadata }: SpawnItemArgs & { id: string }) => {
        if (session.isGuest()) {
            here().addDroppedItem(
                new DroppedItem(id, pt(pos.x, pos.y), item, pt(velocity.x, velocity.y), metadata)
            )
        }
    }
)
