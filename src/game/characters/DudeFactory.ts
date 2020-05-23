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

export const enum DudeType {
    PLAYER,
    DIP,
    ELF,
    ORC_WARRIOR
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
        let animationName: string
        let weapon: string = null
        let shield: string = null
        let maxHealth: number
        let speed: number = 0.085
        let dialogue: Dialogue = null
        let additionalComponents: Component[] = []

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
                additionalComponents = [new NPC()]
                dialogue = Dialogue.DIP_0
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
                animationName = "orc_warrior"
                weapon = "weapon_baton_with_spikes"
                additionalComponents = [new Enemy()]
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
        
        const d = new Dude(
            type, 
            animationName, 
            pos, 
            saveState?.weapon ?? weapon, 
            saveState?.shield ?? shield,
            saveState?.maxHealth ?? maxHealth,
            saveState?.health ?? health,
            saveState?.speed ?? speed,
            inventory,
            saveState?.dialogue ?? dialogue
        )

        new Entity([d as Component].concat(additionalComponents))
        return d
    }
}