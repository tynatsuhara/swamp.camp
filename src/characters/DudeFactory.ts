import { Component, Entity, Point, pt } from "brigsby/dist"
import { Lists } from "brigsby/dist/util"
import { CutscenePlayerController } from "../cutscenes/CutscenePlayerController"
import { Inventory } from "../items/Inventory"
import { Item } from "../items/Items"
import { PlayerInventory } from "../items/PlayerInventory"
import { session } from "../online/session"
import { MULTIPLAYER_ID, syncFn } from "../online/sync"
import { DudeSaveState } from "../saves/DudeSaveState"
import { newUUID } from "../saves/uuid"
import { Singletons } from "../Singletons"
import { Location } from "../world/locations/Location"
import { camp, LocationManager } from "../world/locations/LocationManager"
import { BERTO_STARTING_DIALOGUE } from "./dialogue/BertoDialogue"
import { EMPTY_DIALOGUE } from "./dialogue/Dialogue"
import { DOCTOR_DIALOGUE_ENTRYPOINT } from "./dialogue/DoctorDialogue"
import { SPOOKY_VISITOR_STARTING_DIALOGUE } from "./dialogue/SpookyVisitorDialogue"
import { VILLAGER_DIALOGUE_ENTRYPOINT } from "./dialogue/VillagerDialogue"
import { Dude } from "./Dude"
import { DudeType } from "./DudeType"
import { peopleNames } from "./NameFactory"
import { NPC } from "./NPC"
import { player } from "./player"
import { GuestPlayer } from "./player/GuestPlayer"
import { HostPlayer } from "./player/HostPlayer"
import { AquaticNPC } from "./types/AquaticNPC"
import { Berto } from "./types/Berto"
import { Centaur } from "./types/Centaur"
import { DudeModifier } from "./types/DudeModifier"
import { Enemy } from "./types/Enemy"
import { ShroomNPC } from "./types/ShroomNPC"
import { SpookyVisitor } from "./types/SpookyVisitor"
import { Villager } from "./types/Villager"
import { Visitor } from "./types/Visitor"
import { ShieldType } from "./weapons/ShieldType"
import { WeaponType } from "./weapons/WeaponType"

export enum DudeFaction {
    VILLAGERS,
    CLERGY,
    ORCS, // sounds: rpg/npc/ogre
    UNDEAD,
    DEMONS, // sounds: rpg/npc/shade
    SHROOMS, // sounds: lots of options in rpg/npc/* that could work here
    CENTAURS,
    GNOLLS,
    BEARS,
    WOLVES, // sounds: gumball
    AQUATIC, // sounds: lots of options in rpg/npc/* that could work here
}

const DEFAULT_COLLIDER_SIZE = new Point(10, 8)
const BIG_COLLIDER_SIZE = new Point(15, 12)

export const ONLINE_PLAYER_DUDE_ID_PREFIX = "mp:"

export class DudeFactory {
    static get instance() {
        return Singletons.getOrCreate(DudeFactory)
    }

    newOnlinePlayer(multiplayerId: string) {
        const hostPlayer = player().dude
        this.make(
            DudeType.PLAYER,
            hostPlayer.standingPosition,
            { uuid: ONLINE_PLAYER_DUDE_ID_PREFIX + multiplayerId },
            hostPlayer.location,
            false
        )
    }

    /**
     * Host only!
     * Create a new Dude in the specified location, defaults to the exterior world location
     * @param hasPendingSlot should be true if the character already had a home reserved
     *                       for them. If not, they will try to mark a spot as pending.
     */
    create(type: DudeType, pos: Point, location: Location = camp(), hasPendingSlot = false): Dude {
        return this.syncCreate(type, newUUID(), pos.x, pos.y, location.uuid, hasPendingSlot)
    }

    /**
     * Instantiates a Dude+Entity in the specified location
     */
    load(saveState: DudeSaveState, location: Location) {
        // Guest player state will get serialized but we don't want to spawn them on the host when loading
        // MPTODO: Persist guest state so they can leave and rejoin
        if (session.isHost() && saveState.uuid.startsWith(ONLINE_PLAYER_DUDE_ID_PREFIX)) {
            return
        }

        this.make(saveState.type, Point.fromString(saveState.pos), saveState, location, false)
    }

    private readonly syncCreate = syncFn(
        "df:create",
        (
            type: DudeType,
            uuid: string,
            posX: number,
            posY: number,
            locationUUID: string,
            hasPendingSlot: boolean
        ) => {
            return this.make(
                type,
                pt(posX, posY),
                { uuid },
                LocationManager.instance.get(locationUUID),
                hasPendingSlot
            )
        }
    )

    private make(
        type: DudeType,
        pos: Point,
        saveState: Partial<DudeSaveState>,
        location: Location,
        hasPendingSlot: boolean
    ): Dude {
        const uuid = saveState.uuid

        // defaults
        let factions: DudeFaction[] = [DudeFaction.VILLAGERS]
        let animationName: string
        let weapon: WeaponType = WeaponType.NONE
        let shield: ShieldType = ShieldType.NONE
        let maxHealth: number = 2
        let speed: number = 0.085
        let dialogue: string = EMPTY_DIALOGUE
        let additionalComponents: Component[] = []
        let blob = {}
        let inventoryClass = Inventory
        let defaultInventory = new Inventory()
        let colliderSize = DEFAULT_COLLIDER_SIZE
        let nameGen: () => string = () => undefined

        // type-specific defaults
        switch (type) {
            case DudeType.PLAYER: {
                animationName = "knight_f"
                weapon = WeaponType.SWORD
                shield = ShieldType.BASIC
                maxHealth = 4
                speed = 0.075
                if (session.isHost()) {
                    const isHostPlayerDude = !uuid.startsWith(ONLINE_PLAYER_DUDE_ID_PREFIX)
                    if (isHostPlayerDude) {
                        additionalComponents = [new HostPlayer(), new CutscenePlayerController()]
                        window["player"] = additionalComponents[0]
                    } else {
                        additionalComponents = [new GuestPlayer()]
                    }
                } else {
                    /**
                     * For guest sessions, all the players are basically normal dudes
                     * except for the one that you control, which is responsible for
                     * sending data to the host to update that dude
                     */
                    if (uuid === ONLINE_PLAYER_DUDE_ID_PREFIX + MULTIPLAYER_ID) {
                        additionalComponents = [new GuestPlayer()]
                    }
                }
                // MPTODO: We probably need a GuestPlayerInventory
                inventoryClass = PlayerInventory
                defaultInventory = new PlayerInventory()
                defaultInventory.addItem(Item.SWORD)
                defaultInventory.addItem(Item.BASIC_SHIELD)
                break
            }
            case DudeType.DIP: {
                animationName = "lizard_f"
                maxHealth = Number.MAX_SAFE_INTEGER
                speed *= 0.7
                additionalComponents = [new NPC(), new Villager()]
                window["dip"] = additionalComponents[0]
                break
            }
            case DudeType.HERALD: {
                animationName = "Herald"
                maxHealth = Number.MAX_SAFE_INTEGER
                speed *= 0.6
                dialogue = BERTO_STARTING_DIALOGUE
                additionalComponents = [new NPC(), new Villager(), new Berto()]
                window["berto"] = additionalComponents[0]
                break
            }
            case DudeType.ELF: {
                // unused
                animationName = "elf_m"
                weapon = WeaponType.KATANA
                shield = ShieldType.BASIC
                maxHealth = 4
                additionalComponents = [new NPC(), new Villager()]
                speed *= 0.3 + Math.random() / 2
                break
            }
            case DudeType.ORC_WARRIOR: {
                factions = [DudeFaction.ORCS]
                animationName = Lists.oneOf(["orc_warrior", "masked_orc"])
                weapon = WeaponType.CLUB
                additionalComponents = [new NPC(), new Enemy()]
                maxHealth = 2
                speed *= 0.3 + Math.random() / 2
                break
            }
            case DudeType.ORC_BRUTE: {
                factions = [DudeFaction.ORCS]
                animationName = "ogre"
                weapon = WeaponType.CLUB
                additionalComponents = [new NPC(), new Enemy()]
                maxHealth = 4
                speed *= 0.5
                colliderSize = BIG_COLLIDER_SIZE
                break
            }
            case DudeType.ORC_SHAMAN: {
                factions = [DudeFaction.ORCS]
                animationName = "orc_shaman"
                weapon = WeaponType.STAFF_1
                additionalComponents = [new NPC(), new Enemy()]
                maxHealth = 2
                speed *= 0.4 + Math.random() / 4
                break
            }
            case DudeType.HORNED_DEMON: {
                factions = [DudeFaction.DEMONS]
                animationName = "chort"
                weapon = WeaponType.UNARMED
                additionalComponents = [new NPC(), new Enemy()]
                maxHealth = 2
                speed *= 0.6 + Math.random() / 5
                break
            }
            case DudeType.DEMON_BRUTE: {
                factions = [DudeFaction.DEMONS]
                animationName = "big_demon"
                weapon = WeaponType.UNARMED
                additionalComponents = [new NPC(), new Enemy()]
                maxHealth = 8
                speed *= 1 + 0.3 * Math.random()
                colliderSize = BIG_COLLIDER_SIZE
                break
            }
            case DudeType.SHROOM: {
                factions = [DudeFaction.SHROOMS]
                animationName = "SmallMushroom"
                additionalComponents = [new NPC(), new ShroomNPC()]
                maxHealth = 2
                speed *= 0.6 + Math.random() / 5
                break
            }
            case DudeType.VILLAGER: {
                animationName = `prisoner${Math.ceil(Math.random() * 2)}`
                maxHealth = 4
                speed *= 0.6
                additionalComponents = [new NPC(), new Villager()]
                dialogue = VILLAGER_DIALOGUE_ENTRYPOINT
                break
            }
            case DudeType.DOCTOR: {
                animationName = "doctor"
                maxHealth = 10
                speed *= 0.6
                dialogue = DOCTOR_DIALOGUE_ENTRYPOINT
                additionalComponents = [new NPC(), new Villager()]
                defaultInventory.addItem(Item.WEAK_MEDICINE, 3)
                defaultInventory.addItem(Item.HEART_CONTAINER, 1)
                nameGen = () => peopleNames.generate("<doctor>")
                break
            }
            case DudeType.BLACKSMITH: {
                // unused
                animationName = "Alchemist"
                maxHealth = 10
                speed *= 0.6
                // dialogue = DOCTOR_DIALOGUE_ENTRYPOINT
                additionalComponents = [new NPC(), new Villager()]
                nameGen = () => peopleNames.generate("<blacksmith>")
                break
            }
            case DudeType.SPOOKY_VISITOR: {
                animationName = "necromancer"
                speed *= 0.3
                dialogue = SPOOKY_VISITOR_STARTING_DIALOGUE
                additionalComponents = [
                    new NPC(),
                    new Villager(),
                    new SpookyVisitor(),
                    new Visitor(),
                ]
                maxHealth = Number.MAX_SAFE_INTEGER
                break
            }
            case DudeType.TRAVELING_MERCHANT: {
                animationName = "Merchant"
                speed *= 0.6
                additionalComponents = [new NPC(), new Villager()]
                maxHealth = Number.MAX_SAFE_INTEGER
                break
            }
            case DudeType.CENTAUR: {
                // unused
                factions = [DudeFaction.CENTAURS]
                animationName = "Centaur_M"
                additionalComponents = [new NPC(), new Centaur()]
                maxHealth = 15
                speed *= 0.5
                break
            }
            case DudeType.BEAR: {
                factions = [DudeFaction.BEARS]
                animationName = "Bear"
                weapon = WeaponType.UNARMED
                additionalComponents = [
                    new NPC(),
                    new Enemy(),
                    new DudeModifier(
                        (d) => (d.droppedItemSupplier = () => [Item.MEAT, Item.MEAT, Item.MEAT])
                    ),
                ]
                maxHealth = 5
                speed *= 0.5
                colliderSize = BIG_COLLIDER_SIZE
                break
            }
            case DudeType.WOLF: {
                factions = [DudeFaction.WOLVES]
                animationName = "Wolf"
                weapon = WeaponType.UNARMED
                additionalComponents = [
                    new NPC(),
                    new Enemy(),
                    new DudeModifier((d) => (d.droppedItemSupplier = () => [Item.MEAT])),
                ]
                maxHealth = 2
                speed *= 1
                break
            }
            case DudeType.NUN: {
                factions = [DudeFaction.VILLAGERS, DudeFaction.CLERGY]
                animationName = Lists.oneOf(["FatNun", "NormalNun", "SkinnyNun"])
                additionalComponents = [new NPC(), new Villager()]
                speed *= 0.4
                nameGen = () => peopleNames.generate("<nun>")
                break
            }
            case DudeType.CLERIC: {
                factions = [DudeFaction.VILLAGERS, DudeFaction.CLERGY]
                animationName = Lists.oneOf(["FatCleric", "NormalCleric", "TallCleric"])
                additionalComponents = [new NPC(), new Villager()]
                speed *= 0.4
                nameGen = () => peopleNames.generate("<cleric>")
                break
            }
            case DudeType.BISHOP: {
                factions = [DudeFaction.VILLAGERS, DudeFaction.CLERGY]
                animationName = "Bishop"
                additionalComponents = [new NPC(), new Villager()]
                speed *= 0.3
                nameGen = () => peopleNames.generate("<bishop>")
                break
            }
            case DudeType.SWAMP_THING: {
                factions = [DudeFaction.AQUATIC]
                animationName = "swampy"
                weapon = WeaponType.UNARMED
                additionalComponents = [new NPC(), new Enemy(), new AquaticNPC()]
                maxHealth = 2
                speed *= 0.55
                break
            }
            case DudeType.GNOLL_SCOUT: {
                factions = [DudeFaction.GNOLLS, DudeFaction.WOLVES, DudeFaction.VILLAGERS]
                animationName = "GnollScout"
                weapon = WeaponType.UNARMED
                additionalComponents = [new NPC()]
                maxHealth = 2
                speed *= 0.8
                break
            }
            case DudeType.GUMBALL: {
                factions = [DudeFaction.GNOLLS, DudeFaction.VILLAGERS]
                animationName = "gumball"
                weapon = WeaponType.UNARMED
                additionalComponents = [new NPC(), new Villager()]
                maxHealth = 50
                speed *= 0.7
                break
            }
            case DudeType.ONION: {
                factions = [DudeFaction.VILLAGERS]
                animationName = "onion"
                weapon = WeaponType.UNARMED
                additionalComponents = [new NPC(), new Villager()]
                maxHealth = 50
                speed *= 0.7
                break
            }
            case DudeType.KNIGHT: {
                factions = [DudeFaction.VILLAGERS]
                animationName = "Knight"
                weapon = WeaponType.SWORD
                shield = ShieldType.BASIC
                additionalComponents = [new NPC(), new Villager()]
                maxHealth = 50
                speed *= 0.7
                break
            }
            case DudeType.FOREST_GUARDIAN: {
                factions = [DudeFaction.VILLAGERS]
                animationName = "ForestGuardian"
                weapon = WeaponType.SWORD
                shield = ShieldType.BASIC
                additionalComponents = [new NPC(), new Villager()]
                maxHealth = 30
                speed *= 0.7
                colliderSize = BIG_COLLIDER_SIZE
                break
            }
            default: {
                throw new Error(`DudeType ${type} can't be instantiated`)
            }
        }

        // use saved data instead of defaults
        const d = new Dude({
            uuid,
            hasPendingSlot,
            type,
            factions, // TODO: Save factions? Only if they become mutable
            characterAnimName: saveState?.anim ?? animationName,
            standingPosition: pos,
            weaponType: saveState?.weapon ?? weapon,
            shieldType: saveState?.shield ?? shield,
            maxHealth: saveState?.maxHealth ?? maxHealth,
            health: saveState?.health ?? maxHealth,
            speed: speed ?? speed,
            inventory: saveState?.inventory
                ? inventoryClass.load(saveState.inventory)
                : defaultInventory,
            dialogue: saveState?.dialogue ?? dialogue,
            blob: saveState?.blob ?? blob,
            colliderSize: colliderSize,
            conditions: saveState?.conditions ?? [],
            name: saveState?.name ?? nameGen(),
        })

        location.addDude(d)
        d.location = location

        // Always add dude component first to make sure additional components can access it in awake()
        new Entity([d, ...additionalComponents])

        return d
    }
}
