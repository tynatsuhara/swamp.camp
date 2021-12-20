import { Component } from "brigsby/dist/Component"
import { Entity } from "brigsby/dist/Entity"
import { Point } from "brigsby/dist/Point"
import { Lists } from "brigsby/dist/util/Lists"
import { CutscenePlayerController } from "../cutscenes/CutscenePlayerController"
import { Inventory } from "../items/Inventory"
import { Item } from "../items/Items"
import { PlayerInventory } from "../items/PlayerInventory"
import { DudeSaveState } from "../saves/DudeSaveState"
import { newUUID } from "../saves/uuid"
import { Singletons } from "../Singletons"
import { Location } from "../world/Location"
import { camp } from "../world/LocationManager"
import { BERTO_STARTING_DIALOGUE } from "./dialogue/BertoDialogue"
import { EMPTY_DIALOGUE } from "./dialogue/Dialogue"
import { DOCTOR_DIALOGUE_ENTRYPOINT } from "./dialogue/DoctorDialogue"
import { Dude } from "./Dude"
import { NPC } from "./NPC"
import { Player } from "./Player"
import { AquaticNPC } from "./types/AquaticNPC"
import { Berto } from "./types/Berto"
import { Centaur } from "./types/Centaur"
import { Enemy } from "./types/Enemy"
import { ShroomNPC } from "./types/ShroomNPC"
import { Villager } from "./types/Villager"
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

export enum DudeType {
    PLAYER,
    DIP,
    ELF,
    ORC_WARRIOR,
    HERALD,
    HORNED_DEMON,
    SHROOM,
    VILLAGER,
    CENTAUR,
    BEAR,
    ORC_BRUTE,
    ORC_SHAMAN,
    DEMON_BRUTE,
    WOLF,
    CLERIC,
    NUN,
    BISHOP,
    SWAMP_THING,
    DOCTOR,
}

const DEFAULT_COLLIDER_SIZE = new Point(10, 8)
const BIG_COLLIDER_SIZE = new Point(15, 12)

export class DudeFactory {
    static get instance() {
        return Singletons.getOrCreate(DudeFactory)
    }

    /**
     * Create a new Dude in the specified location, defaults to the exterior world location
     * @param hasPendingSlot should be true if the character already had a home reserved
     *                       for them. If not, they will try to mark a spot as pending.
     */
    new(type: DudeType, pos: Point, location: Location = camp(), hasPendingSlot = false): Dude {
        return this.make(type, pos, null, location, hasPendingSlot)
    }

    /**
     * Instantiates a Dude+Entity in the specified location
     */
    load(saveState: DudeSaveState, location: Location) {
        this.make(saveState.type, Point.fromString(saveState.pos), saveState, location, false)
    }

    private make(
        type: DudeType,
        pos: Point,
        saveState: DudeSaveState,
        location: Location,
        hasPendingSlot: boolean
    ): Dude {
        const uuid = saveState?.uuid ?? newUUID()

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

        // type-specific defaults
        switch (type) {
            case DudeType.PLAYER: {
                animationName = "knight_f"
                weapon = WeaponType.SWORD
                shield = ShieldType.BASIC
                maxHealth = 4
                additionalComponents = [new Player(), new CutscenePlayerController()]
                window["player"] = additionalComponents[0]
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
                break
            }
            case DudeType.CENTAUR: {
                factions = [DudeFaction.CENTAURS]
                animationName = "Centaur_M"
                additionalComponents = [new NPC(), new Centaur()]
                maxHealth = 2
                speed *= 0.5
                break
            }
            case DudeType.BEAR: {
                factions = [DudeFaction.BEARS]
                animationName = "Bear"
                weapon = WeaponType.UNARMED
                additionalComponents = [new NPC(), new Enemy()]
                maxHealth = 5
                speed *= 0.5
                colliderSize = BIG_COLLIDER_SIZE
                break
            }
            case DudeType.WOLF: {
                factions = [DudeFaction.WOLVES]
                animationName = "Wolf"
                weapon = WeaponType.UNARMED
                additionalComponents = [new NPC(), new Enemy()]
                maxHealth = 2
                speed *= 1
                break
            }
            case DudeType.NUN:
                factions = [DudeFaction.VILLAGERS, DudeFaction.CLERGY]
                animationName = Lists.oneOf(["FatNun", "NormalNun", "SkinnyNun"])
                additionalComponents = [new NPC(), new Villager()]
                speed *= 0.4
                break
            case DudeType.CLERIC:
                factions = [DudeFaction.VILLAGERS, DudeFaction.CLERGY]
                animationName = Lists.oneOf(["FatCleric", "NormalCleric", "TallCleric"])
                additionalComponents = [new NPC(), new Villager()]
                speed *= 0.4
                break
            case DudeType.BISHOP: {
                factions = [DudeFaction.VILLAGERS, DudeFaction.CLERGY]
                animationName = "Bishop"
                additionalComponents = [new NPC(), new Villager()]
                speed *= 0.3
                break
            }
            case DudeType.SWAMP_THING:
                factions = [DudeFaction.AQUATIC]
                animationName = "swampy"
                weapon = WeaponType.UNARMED
                additionalComponents = [new NPC(), new Enemy(), new AquaticNPC()]
                maxHealth = 2
                speed *= 0.55
                break
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
            position: pos,
            weaponType: saveState?.weapon ?? weapon,
            shieldType: saveState?.shield ?? shield,
            maxHealth: saveState?.maxHealth ?? maxHealth,
            health: saveState?.health ?? maxHealth,
            speed: saveState?.speed ?? speed,
            inventory: saveState?.inventory
                ? inventoryClass.load(saveState.inventory)
                : defaultInventory,
            dialogue: saveState?.dialogue ?? dialogue,
            blob: saveState?.blob ?? blob,
            colliderSize: colliderSize,
            conditions: saveState?.conditions ?? [],
        })

        location.dudes.add(d)
        d.location = location

        // Always add dude component first to make sure additional components can access it in awake()
        new Entity([d, ...additionalComponents])

        return d
    }
}
