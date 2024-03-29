import { Component, Entity, expose, Point, pt } from "brigsby/dist"
import { PointValue } from "brigsby/dist/Point"
import { Lists } from "brigsby/dist/util"
import { saveManager } from "../core/SaveManager"
import { Singletons } from "../core/Singletons"
import { CutscenePlayerController } from "../cutscenes/CutscenePlayerController"
import { pixelPtToTilePt, TILE_SIZE } from "../graphics/Tilesets"
import { Inventory } from "../items/Inventory"
import { Item } from "../items/Item"
import { PlayerInventory } from "../items/PlayerInventory"
import { session } from "../online/session"
import { MULTIPLAYER_ID } from "../online/syncGame"
import { ONLINE_PLAYER_DUDE_ID_PREFIX, syncFn } from "../online/syncUtils"
import { DudeSaveState } from "../saves/DudeSaveState"
import { newUUID } from "../saves/uuid"
import { tilesAround } from "../utils/misc"
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
import { Dip } from "./types/Dip"
import { DudeModifier } from "./types/DudeModifier"
import { Enemy } from "./types/Enemy"
import { Mimic } from "./types/Mimic"
import { Onion } from "./types/Onion"
import { ShamanHealer } from "./types/ShamanHealer"
import { ShroomNPC } from "./types/ShroomNPC"
import { SpookyVisitor } from "./types/SpookyVisitor"
import { Villager } from "./types/Villager"
import { Visitor } from "./types/Visitor"
import { ShieldType } from "./weapons/ShieldType"
import { WeaponType } from "./weapons/WeaponType"

export enum DudeFaction {
    VILLAGERS,
    CLERGY,
    ORCS,
    UNDEAD,
    DEMONS,
    SHROOMS,
    CENTAURS,
    GNOLLS,
    BEARS,
    WOLVES,
    AQUATIC,
}

const DEFAULT_COLLIDER_SIZE = new Point(10, 8)
const BIG_COLLIDER_SIZE = new Point(15, 12)

export class DudeFactory {
    static get instance() {
        return Singletons.getOrCreate(DudeFactory)
    }

    /**
     * Host only!
     * @param multiplayerId
     */
    newOnlinePlayer(uuid: string) {
        const playerSaveData = saveManager.getState().onlinePlayers[uuid]
        playerSaveData.uuid = uuid

        const position = (() => {
            if (playerSaveData?.pos) {
                return Point.fromString(playerSaveData.pos)
            }
            const tileOptions = tilesAround(player().tile, 3)
                .filter((p) => player().location.getGround(p) && !player().location.isOccupied(p))
                .sort((a, b) => a.distanceTo(player().tile) - b.distanceTo(player().tile))
            // take any tile in the 2nd half when sorted by distance
            const furtherHalf = tileOptions.slice(tileOptions.length / 2)
            return Lists.oneOf(furtherHalf).plus(pt(0.5)).times(TILE_SIZE)
        })()

        this.make(DudeType.PLAYER, position, playerSaveData, player().location, false)
    }

    /**
     * Host only!
     * Create a new Dude in the specified location, defaults to the exterior world location
     * @param hasPendingSlot should be true if the character already had a home reserved
     *                       for them. If not, they will try to mark a spot as pending.
     */
    create(
        type: DudeType,
        standingPosition: Point,
        location: Location = camp(),
        hasPendingSlot = false,
        existingData: Partial<DudeSaveState> = {}
    ): Dude {
        return this.syncMake(
            type,
            standingPosition.apply(Math.floor),
            { uuid: newUUID(), ...existingData },
            location.uuid,
            hasPendingSlot
        )
    }

    /**
     * Runs on host and client
     * Instantiates a Dude+Entity in the specified location
     */
    load(saveState: DudeSaveState, location: Location) {
        // Guest player state will get serialized but we don't want to spawn them on the host when loading
        if (session.isHost() && saveState.uuid.startsWith(ONLINE_PLAYER_DUDE_ID_PREFIX)) {
            return
        }

        this.make(saveState.type, Point.fromString(saveState.pos), saveState, location, false)
    }

    private readonly syncMake = syncFn(
        "df:make",
        (
            type: DudeType,
            standingPosition: PointValue,
            saveState: Partial<DudeSaveState> & { uuid: string },
            locationUUID: string,
            hasPendingSlot: boolean
        ) => {
            return this.make(
                type,
                standingPosition,
                saveState,
                LocationManager.instance.get(locationUUID),
                hasPendingSlot
            )
        }
    )

    private make(
        type: DudeType,
        standingPosition: PointValue,
        saveState: Partial<DudeSaveState> & { uuid: string },
        location: Location,
        hasPendingSlot: boolean
    ): Dude {
        const uuid = saveState.uuid
        const invIdPrefix = Dude.createSyncId(uuid, "iv")

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
        let inventorySupplier = () => new Inventory(invIdPrefix)
        let defaultInventorySupplier = () => new Inventory(invIdPrefix)
        let colliderSize = DEFAULT_COLLIDER_SIZE
        let nameGen: () => string = () => undefined

        // type-specific defaults
        switch (type) {
            case DudeType.PLAYER: {
                animationName = "lizard_m"
                weapon = WeaponType.SWORD
                shield = ShieldType.BASIC
                maxHealth = 4
                speed = 0.075

                // Inventory stuff
                const isLocalHostPlayer =
                    session.isHost() && !uuid.startsWith(ONLINE_PLAYER_DUDE_ID_PREFIX)
                const isLocalGuestPlayer = uuid === ONLINE_PLAYER_DUDE_ID_PREFIX + MULTIPLAYER_ID
                inventorySupplier = () => new PlayerInventory(uuid)
                defaultInventorySupplier = () => {
                    const defaultPlayerInv = new PlayerInventory(uuid)
                    defaultPlayerInv.addItem(Item.SWORD, 1, { equipped: "weapon" }, true)
                    defaultPlayerInv.addItem(Item.BASIC_SHIELD, 1, { equipped: "shield" }, true)
                    return defaultPlayerInv
                }

                if (session.isHost()) {
                    if (isLocalHostPlayer) {
                        animationName = "knight_f"
                        additionalComponents = [new HostPlayer(), new CutscenePlayerController()]
                        expose({ player: additionalComponents[0] })
                    } else {
                        additionalComponents = [new GuestPlayer()]
                        const playerIndex =
                            location.getDudes().filter((d) => d.type === DudeType.PLAYER).length + 1
                        expose({ [`player${playerIndex}`]: additionalComponents[0] })
                    }
                } else {
                    /**
                     * For guest sessions, all the players are basically normal dudes
                     * except for the one that you control, which is responsible for
                     * sending data to the host to update that dude
                     */
                    if (isLocalGuestPlayer) {
                        additionalComponents = [new GuestPlayer(), new CutscenePlayerController()]
                        expose({ player: additionalComponents[0] })
                    } else {
                        // This is an uncontrolled player on a different guest's machine
                    }
                }
                break
            }
            case DudeType.DIP: {
                animationName = "lizard_f"
                maxHealth = Number.MAX_SAFE_INTEGER
                speed *= 0.7
                additionalComponents = [new NPC(), new Villager(), new Dip()]
                expose({ dip: additionalComponents[0] })
                break
            }
            case DudeType.HERALD: {
                animationName = "Herald"
                maxHealth = Number.MAX_SAFE_INTEGER
                speed *= 0.6
                dialogue = BERTO_STARTING_DIALOGUE
                additionalComponents = [new NPC(), new Villager(), new Berto()]
                expose({ berto: additionalComponents[2] })
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
                animationName = `prisoner${Math.ceil(Math.random() * 4)}`
                maxHealth = 4
                speed *= 0.5 + Math.random() * 0.2
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
                defaultInventorySupplier = () => {
                    const inv = new Inventory(invIdPrefix)
                    inv.addItem(Item.WEAK_MEDICINE, 3)
                    inv.addItem(Item.HEART_CONTAINER, 1)
                    return inv
                }
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
                        (d) =>
                            (d.droppedItemSupplier = () => [
                                Item.RAW_MEAT,
                                Item.RAW_MEAT,
                                Item.RAW_MEAT,
                            ])
                    ),
                ]
                maxHealth = 10
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
                    new DudeModifier((d) => (d.droppedItemSupplier = () => [Item.RAW_MEAT])),
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
                factions = [DudeFaction.GNOLLS, DudeFaction.WOLVES]
                animationName = "GnollScout"
                weapon = WeaponType.UNARMED
                additionalComponents = [new NPC()]
                maxHealth = 2
                speed *= 0.8
                break
            }
            case DudeType.GNOLL_SHAMAN: {
                factions = [DudeFaction.GNOLLS, DudeFaction.WOLVES]
                animationName = "GnollShaman"
                weapon = WeaponType.UNARMED
                additionalComponents = [new NPC(), new ShamanHealer()]
                maxHealth = 2
                speed *= 0.8
                break
            }
            case DudeType.GNOLL_OVERSEER: {
                factions = [DudeFaction.GNOLLS, DudeFaction.WOLVES]
                animationName = "GnollOverseer"
                weapon = WeaponType.UNARMED
                additionalComponents = [new NPC()]
                maxHealth = 20
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
                weapon = WeaponType.NONE
                additionalComponents = [new NPC(), new Villager(), new Onion()]
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
                // TODO
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
            case DudeType.MIMIC: {
                // align so it looks the same as a chest item
                if (!Mimic.isTriggered(blob)) {
                    standingPosition = pixelPtToTilePt(standingPosition)
                        .times(TILE_SIZE)
                        .plus(pt(8, 16))
                }
                factions = [] // TODO?
                animationName = "chest_mimic"
                weapon = WeaponType.UNARMED
                additionalComponents = [new NPC(), new Mimic()]
                maxHealth = 5
                speed *= 0.7
                break
            }
            case DudeType.SKELETON: {
                factions = [DudeFaction.UNDEAD]
                animationName = "mr-bones"
                weapon = WeaponType.SWORD
                shield = ShieldType.BASIC
                additionalComponents = [new NPC(), new Enemy()]
                maxHealth = 5
                speed *= 0.4
                break
            }
            default: {
                throw new Error(`DudeType ${type} can't be instantiated`)
            }
        }

        const inventory = saveState?.inventory
            ? inventorySupplier().load(saveState.inventory)
            : defaultInventorySupplier()

        // use saved data instead of defaults
        const d = new Dude({
            uuid,
            hasPendingSlot,
            type,
            factions, // Factions aren't serialized because they're immutable
            characterAnimName: saveState?.anim ?? animationName,
            standingPosition: pt(standingPosition.x, standingPosition.y),
            weaponType: saveState?.weapon ?? weapon,
            shieldType: saveState?.shield ?? shield,
            maxHealth: saveState?.maxHealth ?? maxHealth,
            health: saveState?.health ?? maxHealth,
            speed: speed ?? speed,
            inventory,
            dialogue: saveState?.dialogue ?? dialogue,
            blob: saveState?.blob ?? blob,
            colliderSize: colliderSize,
            conditions: saveState?.conditions ?? [],
            name: saveState?.name ?? nameGen(),
            lastDamageTime: saveState.lastDmgTime ?? 0,
        })

        location.addDude(d)
        d.location = location

        // Always add dude component first to make sure additional components can access it in awake()
        new Entity([d, ...additionalComponents])

        return d
    }
}
