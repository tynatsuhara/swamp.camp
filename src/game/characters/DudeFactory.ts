import { Entity } from "../../engine/Entity"
import { Point } from "../../engine/point"
import { Component } from "../../engine/component"
import { Player } from "./Player"
import { Dude } from "./Dude"
import { NPC } from "./NPC"
import { LocationManager } from "../world/LocationManager"
import { Enemy } from "./Enemy"
import { DudeSaveState } from "../saves/DudeSaveState"
import { Inventory } from "../items/Inventory"
import { Dialogue } from "./Dialogue"
import { CutscenePlayerController } from "../cutscenes/CutscenePlayerController"
import { Villager } from "./Villager"
import { NPCSchedules } from "./NPCSchedule"
import { WorldLocation } from "../world/WorldLocation"
import { Lists } from "../../engine/util/Lists"
import { WeaponType } from "./Weapon"
import { Item } from "../items/Items"

export const enum DudeFaction {
    VILLAGERS,
    ORCS,
    UNDEAD,
    DEMONS,
}

export const enum DudeType {
    PLAYER,
    DIP,
    ELF,
    ORC_WARRIOR,
    HERALD,
    HORNED_DEMON
}

export class DudeFactory {

    static instance: DudeFactory

    constructor() {
        DudeFactory.instance = this
    }

    /**
     * Create a new Dude in the specified location, defaults to the exterior world location
     */
    new(type: DudeType, pos: Point, location: WorldLocation = LocationManager.instance.exterior()): Dude {
        const d = this.make(type, pos, null, location)
        location.dudes.add(d)
        return d
    }

    /**
     * Instantiates a Dude+Entity in the specified location
     */
    load(saveState: DudeSaveState, location: WorldLocation) {
        const d = this.make(saveState.type, Point.fromString(saveState.pos), saveState, location)
        location.dudes.add(d)
    }

    private make(
        type: DudeType, 
        pos: Point,
        saveState: DudeSaveState,
        location: WorldLocation
    ): Dude {
        // defaults
        let faction: DudeFaction = DudeFaction.VILLAGERS
        let animationName: string
        let weapon: WeaponType = WeaponType.NONE
        let shield: string = null
        let maxHealth: number
        let speed: number = 0.085
        let dialogue: Dialogue = Dialogue.NONE
        let additionalComponents: Component[] = []
        let blob = {}
        const defaultInventory = new Inventory()

        // type-specific defaults
        switch(type) {
            case DudeType.PLAYER: {
                animationName = "knight_f"
                weapon = WeaponType.SWORD
                shield = "shield_0"
                maxHealth = 4
                additionalComponents = [new Player(), new CutscenePlayerController()]
                window["player"] = additionalComponents[0]
                defaultInventory.addItem(Item.SWORD)
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
                dialogue = Dialogue.BERT_0
                additionalComponents = [
                    new NPC(NPCSchedules.newGoToSchedule(  // filter out occupied points to not get stuck in the campfire
                        Lists.oneOf([new Point(-3, 0), new Point(-3, 1), new Point(-2, 0), new Point(-2, 1)].filter(pt => !location.elements.get(pt)))
                    )),
                    new Villager()
                ]
                window["berto"] = additionalComponents[0]
                break
            }
            case DudeType.ELF: {
                animationName = "elf_m"
                weapon = WeaponType.KATANA
                shield = "shield_0"
                maxHealth = 4
                additionalComponents = [new NPC(), new Villager()]
                speed *= (.3 + Math.random()/2)
                break
            }
            case DudeType.ORC_WARRIOR: {
                faction = DudeFaction.ORCS
                animationName = "orc_warrior"
                weapon = WeaponType.CLUB
                additionalComponents = [new NPC(), new Enemy()]
                maxHealth = 2
                speed *= (.3 + Math.random()/2)
                break
            }
            case DudeType.HORNED_DEMON: {
                faction = DudeFaction.DEMONS
                animationName = "chort" 
                weapon = WeaponType.UNARMED
                additionalComponents = [new NPC(NPCSchedules.newFreeRoamSchedule()), new Enemy()]
                maxHealth = 2
                speed *= (.6 + Math.random()/5)
                break
            }
            default: {
                throw new Error(`DudeType ${type} can't be instantiated`)
            }
        }

        // use saved data instead of defaults
        const d = new Dude(
            type, 
            faction,
            animationName, 
            pos, 
            saveState?.weapon ?? weapon,  // TODO: update this logic when we make it so you can drop weapons/shields
            saveState?.shield ?? shield,
            saveState?.maxHealth ?? maxHealth,
            saveState?.health ?? maxHealth,
            saveState?.speed ?? speed,
            !!saveState?.inventory ? Inventory.load(saveState.inventory) : defaultInventory,
            saveState?.dialogue ?? dialogue,
            saveState?.blob ?? blob,
        )

        new Entity([d as Component].concat(additionalComponents))
        return d
    }
}