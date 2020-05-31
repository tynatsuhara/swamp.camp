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
import { DipController } from "./DipController"

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
    HERALD
}

export class DudeFactory {

    static instance: DudeFactory

    constructor() {
        DudeFactory.instance = this
    }

    /**
     * Create a new Dude in the current location
     */
    new(type: DudeType, pos: Point): Dude {
        const d = this.make(type, pos)
        LocationManager.instance.currentLocation.dudes.add(d)
        return d
    }

    /**
     * Instantiates a Dude+Entity, which needs to be attached to a location
     */
    load(saveState: DudeSaveState): Dude {
        return this.make(saveState.type, Point.fromString(saveState.pos), saveState)
    }

    private make(
        type: DudeType, 
        pos: Point,
        saveState: DudeSaveState = null
    ): Dude {
        // defaults
        let faction: DudeFaction = DudeFaction.VILLAGERS
        let animationName: string
        let weapon: string = null
        let shield: string = null
        let maxHealth: number
        let speed: number = 0.085
        let dialogue: Dialogue = Dialogue.NONE
        let additionalComponents: Component[] = []
        let blob = {}

        // type-specific defaults
        switch(type) {
            case DudeType.PLAYER: {
                animationName = "knight_f"
                weapon = "weapon_regular_sword"
                shield = "shield_0"
                maxHealth = 4
                additionalComponents = [new Player(), new CutscenePlayerController()]
                break
            }
            case DudeType.DIP: {
                animationName = "lizard_f"
                maxHealth = Number.MAX_SAFE_INTEGER
                blob = DipController.makeInitialState()
                speed *= .7
                additionalComponents = [new NPC()]
                break
            }
            case DudeType.HERALD: {
                animationName = "Herald"
                maxHealth = Number.MAX_SAFE_INTEGER
                additionalComponents = [new NPC()]
                break
            }
            case DudeType.ELF: {
                animationName = "elf_m"
                weapon = "weapon_katana"
                shield = "shield_0"
                maxHealth = 4
                additionalComponents = [new NPC()]
                speed *= (.3 + Math.random()/2)
                break
            }
            case DudeType.ORC_WARRIOR: {
                faction = DudeFaction.ORCS
                animationName = "orc_warrior"
                weapon = "weapon_baton_with_spikes"
                additionalComponents = [new NPC(), new Enemy()]
                maxHealth = 2
                speed *= (.3 + Math.random()/2)
                break
            }
            default: {
                throw new Error(`DudeType ${type} can't be instantiated`)
            }
        }

        let health = maxHealth
        let inventory = !!saveState?.inventory ? Inventory.load(saveState.inventory) : new Inventory()
        
        // use saved data instead of defaults
        const d = new Dude(
            type, 
            faction,
            animationName, 
            pos, 
            saveState?.weapon ?? weapon,  // TODO: update this logic when we make it so you can drop weapons/shields
            saveState?.shield ?? shield,
            saveState?.maxHealth ?? maxHealth,
            saveState?.health ?? health,
            saveState?.speed ?? speed,
            inventory,
            saveState?.dialogue ?? dialogue,
            saveState?.blob ?? blob,
        )

        new Entity([d as Component].concat(additionalComponents))
        return d
    }
}