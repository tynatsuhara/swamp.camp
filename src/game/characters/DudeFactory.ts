import { Entity } from "../../engine/Entity"
import { Point } from "../../engine/point"
import { Component } from "../../engine/component"
import { Player } from "./Player"
import { Dude } from "./Dude"
import { NPC } from "./NPC"
import { LocationManager } from "../world/LocationManager"

export enum DudeType {
    PLAYER,
    ELF,
    ORC_WARRIOR
}

export class DudeFactory {

    new(type: DudeType, pos: Point): Dude {
        switch(type) {
            case DudeType.PLAYER: {
                return this.make(type, "knight_f", pos, "weapon_regular_sword", new Player())
            }
            case DudeType.ELF: {
                return this.make(type, "elf_m", pos, "weapon_katana", new NPC())
            }
            case DudeType.ORC_WARRIOR: {
                return this.make(type, "orc_warrior", pos, "weapon_baton_with_spikes", new NPC())
            }
        }
        throw new Error(`DudeType ${type} can't be instantiated`)
    }

    private make(
        type: DudeType, 
        characterAnimName: string, 
        pos: Point, 
        weapon: string, 
        ...additionalComponents: Component[]
    ) {
        const e = new Entity([new Dude(type, characterAnimName, pos, weapon) as Component].concat(additionalComponents))
        const d = e.getComponent(Dude)
        LocationManager.instance.currentLocation.dudes.add(d)
        return d
    }
}