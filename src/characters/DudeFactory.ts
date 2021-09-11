import { Entity } from "brigsby/dist/Entity"
import { Point } from "brigsby/dist/Point"
import { Component } from "brigsby/dist/Component"
import { Player } from "./Player"
import { Dude } from "./Dude"
import { NPC } from "./NPC"
import { LocationManager } from "../world/LocationManager"
import { Enemy } from "./types/Enemy"
import { DudeSaveState } from "../saves/DudeSaveState"
import { Inventory } from "../items/Inventory"
import { EMPTY_DIALOGUE } from "./dialogue/Dialogue"
import { CutscenePlayerController } from "../cutscenes/CutscenePlayerController"
import { Villager } from "./types/Villager"
import { NPCSchedules } from "./ai/NPCSchedule"
import { WorldLocation } from "../world/WorldLocation"
import { Lists } from "brigsby/dist/util/Lists"
import { WeaponType } from "./weapons/WeaponType"
import { Item } from "../items/Items"
import { BERTO_STARTING_DIALOGUE } from "./dialogue/BertoDialogue"
import { ShroomNPC } from "./types/ShroomNPC"
import { newUUID } from "../saves/uuid"
import { Centaur } from "./types/Centaur"
import { ShieldType } from "./weapons/ShieldType"
import { Singletons } from "../Singletons"
import { Residence } from "../world/residences/Residence"

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
}

export class DudeFactory {

    static get instance() {
        return Singletons.getOrCreate(DudeFactory)
    }
    
    /**
     * Create a new Dude in the specified location, defaults to the exterior world location
     */
    new(type: DudeType, pos: Point, location: WorldLocation = LocationManager.instance.exterior()): Dude {
        return this.make(type, pos, null, location)
    }

    /**
     * Instantiates a Dude+Entity in the specified location
     */
    load(saveState: DudeSaveState, location: WorldLocation) {
        this.make(saveState.type, Point.fromString(saveState.pos), saveState, location)
    }

    private make(
        type: DudeType, 
        pos: Point,
        saveState: DudeSaveState,
        location: WorldLocation
    ): Dude {
        const uuid = saveState?.uuid ?? newUUID()

        this.claimResidence(type, uuid)

        // defaults
        let factions: DudeFaction[] = [DudeFaction.VILLAGERS]
        let animationName: string
        let weapon: WeaponType = WeaponType.NONE
        let shield: ShieldType = ShieldType.NONE
        let maxHealth: number
        let speed: number = 0.085
        let dialogue: string = EMPTY_DIALOGUE
        let additionalComponents: Component[] = []
        let blob = {}
        const defaultInventory = new Inventory()
        const defaultColliderSize = new Point(10, 8)
        const bigColliderSize = defaultColliderSize.times(1.5)
        let colliderSize = defaultColliderSize

        // type-specific defaults
        switch(type) {
            case DudeType.PLAYER: {
                animationName = "knight_f"
                weapon = WeaponType.SWORD
                shield = ShieldType.BASIC
                maxHealth = 4
                additionalComponents = [new Player(), new CutscenePlayerController()]
                window["player"] = additionalComponents[0]
                defaultInventory.addItem(Item.SWORD)
                defaultInventory.addItem(Item.BASIC_SHIELD)
                break
            }
            case DudeType.DIP: {
                animationName = "lizard_f"
                maxHealth = Number.MAX_SAFE_INTEGER
                speed *= .7
                additionalComponents = [
                    new NPC(NPCSchedules.newGoToSchedule(new Point(0, 0))), 
                    new Villager()
                ]
                window["dip"] = additionalComponents[0]
                break
            }
            case DudeType.HERALD: {
                animationName = "Herald"
                maxHealth = Number.MAX_SAFE_INTEGER
                speed *= .6
                dialogue = BERTO_STARTING_DIALOGUE
                additionalComponents = [
                    new NPC(NPCSchedules.newGoToSchedule(  // filter out occupied points to not get stuck in the campfire
                        Lists.oneOf([new Point(-3, 0), new Point(-3, 1), new Point(-2, 0), new Point(-2, 1)].filter(pt => !location.isOccupied(pt)))
                    )),
                    new Villager()
                ]
                window["berto"] = additionalComponents[0]
                break
            }
            case DudeType.ELF: {
                animationName = "elf_m"
                weapon = WeaponType.KATANA
                shield = ShieldType.BASIC
                maxHealth = 4
                additionalComponents = [new NPC(), new Villager()]
                speed *= (.3 + Math.random()/2)
                break
            }
            case DudeType.ORC_WARRIOR: {
                factions = [DudeFaction.ORCS]
                animationName = Lists.oneOf(["orc_warrior", "masked_orc"])
                weapon = WeaponType.CLUB
                additionalComponents = [new NPC(), new Enemy()]
                maxHealth = 2
                speed *= (.3 + Math.random()/2)
                break
            }
            case DudeType.ORC_BRUTE: {
                factions = [DudeFaction.ORCS]
                animationName = "ogre"
                weapon = WeaponType.CLUB
                additionalComponents = [new NPC(), new Enemy()]
                maxHealth = 4
                speed *= .5
                colliderSize = bigColliderSize
                break
            }
            case DudeType.ORC_SHAMAN: {
                factions = [DudeFaction.ORCS]
                animationName = "orc_shaman"
                weapon = WeaponType.STAFF_1
                additionalComponents = [new NPC(), new Enemy()]
                maxHealth = 2
                speed *= (.4 + Math.random()/4)
                break
            }
            case DudeType.HORNED_DEMON: {
                factions = [DudeFaction.DEMONS]
                animationName = "chort" 
                weapon = WeaponType.UNARMED
                additionalComponents = [new NPC(NPCSchedules.newFreeRoamInDarkSchedule()), new Enemy()]
                maxHealth = 2
                speed *= (.6 + Math.random()/5)
                break
            }
            case DudeType.DEMON_BRUTE: {
                factions = [DudeFaction.DEMONS]
                animationName = "big_demon" 
                weapon = WeaponType.UNARMED
                additionalComponents = [new NPC(NPCSchedules.newFreeRoamInDarkSchedule()), new Enemy()]
                maxHealth = 8
                speed *= (1 + .3 * Math.random())
                colliderSize = bigColliderSize
                break
            }
            case DudeType.SHROOM: {
                factions = [DudeFaction.SHROOMS]
                animationName = "SmallMushroom" 
                additionalComponents = [new NPC(NPCSchedules.newFreeRoamSchedule()), new ShroomNPC()]
                maxHealth = 2
                speed *= (.6 + Math.random()/5)
                break
            }
            case DudeType.VILLAGER: {
                animationName = `prisoner${Math.ceil(Math.random() * 2)}`
                maxHealth = 4
                speed *= .6
                // TODO: add a new type of schedule for a villager with a home
                additionalComponents = [new NPC(NPCSchedules.newDefaultVillagerSchedule()), new Villager()]
                break
            }
            case DudeType.CENTAUR: {
                factions = [DudeFaction.CENTAURS]
                animationName = "Centaur_M" 
                additionalComponents = [new NPC(NPCSchedules.newFreeRoamSchedule()), new Centaur()]
                maxHealth = 2
                speed *= .5
                break
            }
            case DudeType.BEAR: {
                factions = [DudeFaction.BEARS]
                animationName = "Bear"
                weapon = WeaponType.UNARMED
                additionalComponents = [new NPC(), new Enemy()]
                maxHealth = 5
                speed *= .5
                colliderSize = bigColliderSize
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
            case DudeType.CLERIC:
                animationName = Lists.oneOf(["FatCleric", "NormalCleric", "TallCleric"])
                factions = [DudeFaction.VILLAGERS, DudeFaction.CLERGY]
                additionalComponents = [new NPC()]
                speed *= .3
                break
            case DudeType.NUN:
                animationName = Lists.oneOf(["FatNun", "NormalNun", "TallNun"])
                factions = [DudeFaction.VILLAGERS, DudeFaction.CLERGY]
                additionalComponents = [new NPC()]
                speed *= .3
                break
            case DudeType.BISHOP: {
                animationName = "Bishop"
                factions = [DudeFaction.VILLAGERS, DudeFaction.CLERGY]
                additionalComponents = [new NPC()]
                speed *= .2
                break
            }
            default: {
                throw new Error(`DudeType ${type} can't be instantiated`)
            }
        }

        // use saved data instead of defaults
        const d = new Dude(
            uuid,
            type, 
            factions,  // TODO: Save factions? Only if they become mutable
            saveState?.anim ?? animationName, 
            pos, 
            saveState?.weapon ?? weapon,
            saveState?.shield ?? shield,
            saveState?.maxHealth ?? maxHealth,
            saveState?.health ?? maxHealth,
            saveState?.speed ?? speed,
            !!saveState?.inventory ? Inventory.load(saveState.inventory) : defaultInventory,
            saveState?.dialogue ?? dialogue,
            saveState?.blob ?? blob,
            colliderSize,
        )

        // Always add dude component first to make sure additional components can access it
        new Entity([d as Component].concat(additionalComponents))

        location.dudes.add(d)
        d.location = location

        return d
    }

    private claimResidence(type: DudeType, uuid: string) {
        if (!LocationManager.instance.exterior()) {
            // Our locations aren't initialized yet, so this NPC is being spawned as a 
            // save is loaded. We can assume that the residence is already configured.
            return
        }

        const residences = LocationManager.instance.exterior()
            .getElements()
            .map(e => e.entity.getComponent(Residence))
            .filter(e => !!e)

        const hasResidence = residences.some(residence => residence.isHomeOf(uuid))

        if (hasResidence) {
            return
        }
    
        const pending = residences.filter(res => res?.canClaimPendingSlot(type))
        if (pending.length > 0) {
            pending[0].claimPendingSlot(uuid)
        }

        // TODO: this might make someone homeless if you spawn an NPC with dev controls
    }
}
