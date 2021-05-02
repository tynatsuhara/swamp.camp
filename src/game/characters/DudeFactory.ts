import { Entity } from "../../engine/Entity"
import { Point } from "../../engine/Point"
import { Component } from "../../engine/Component"
import { Player } from "./Player"
import { Dude } from "./Dude"
import { NPC } from "./NPC"
import { LocationManager } from "../world/LocationManager"
import { Enemy } from "./Enemy"
import { DudeSaveState } from "../saves/DudeSaveState"
import { Inventory } from "../items/Inventory"
import { EMPTY_DIALOGUE } from "./Dialogue"
import { CutscenePlayerController } from "../cutscenes/CutscenePlayerController"
import { Villager } from "./Villager"
import { NPCSchedules } from "./NPCSchedule"
import { WorldLocation } from "../world/WorldLocation"
import { Lists } from "../../engine/util/Lists"
import { WeaponType } from "./weapons/WeaponType"
import { Item } from "../items/Items"
import { BERTO_STARTING_DIALOGUE } from "./dialogues/BertoIntro"
import { ShroomNPC } from "./ShroomNPC"
import { newUUID } from "../saves/uuid"
import { Centaur } from "./Centaur"
import { ShieldType } from "./weapons/ShieldType"

export const enum DudeFaction {
    VILLAGERS,
    ORCS,
    UNDEAD,
    DEMONS,
    SHROOMS,
    CENTAURS,
    GNOLLS,
    BEARS,
}

export const enum DudeType {
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
}

export class DudeFactory {

    private static _instance: DudeFactory
    static get instance(): DudeFactory {
        if (!this._instance) {
            this._instance = new DudeFactory()
        }
        return this._instance
    }

    private constructor() {
        DudeFactory._instance = this
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
        let colliderSize = new Point(10, 8)

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
                animationName = "orc_warrior"
                weapon = WeaponType.CLUB
                additionalComponents = [new NPC(), new Enemy()]
                maxHealth = 2
                speed *= (.3 + Math.random()/2)
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
            case DudeType.SHROOM:
                factions = [DudeFaction.SHROOMS]
                animationName = "SmallMushroom" 
                additionalComponents = [new NPC(NPCSchedules.newFreeRoamSchedule()), new ShroomNPC()]
                maxHealth = 2
                speed *= (.6 + Math.random()/5)
                break
            case DudeType.VILLAGER:
                animationName = `prisoner${Math.ceil(Math.random() * 2)}`
                maxHealth = 4
                speed *= .6
                // TODO: add a new type of schedule for a villager with a home
                additionalComponents = [new NPC(NPCSchedules.newDefaultVillagerSchedule()), new Villager()]
                break
            case DudeType.CENTAUR:
                factions = [DudeFaction.CENTAURS]
                animationName = "Centaur_M" 
                additionalComponents = [new NPC(NPCSchedules.newFreeRoamSchedule()), new Centaur()]
                maxHealth = 2
                speed *= .5
                break
            case DudeType.BEAR:
                factions = [DudeFaction.BEARS]
                animationName = "Bear"
                weapon = WeaponType.UNARMED
                additionalComponents = [new NPC(), new Enemy()]
                maxHealth = 5
                speed *= .5
                colliderSize = colliderSize.times(1.5)
                break
            default: {
                throw new Error(`DudeType ${type} can't be instantiated`)
            }
        }

        // use saved data instead of defaults
        const d = new Dude(
            saveState?.uuid ?? newUUID(),
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

        new Entity([d as Component].concat(additionalComponents))

        location.dudes.add(d)
        d.location = location

        return d
    }
}