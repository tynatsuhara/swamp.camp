import { Entity } from "../../engine/Entity"
import { Point } from "../../engine/point"
import { Component } from "../../engine/component"
import { Player } from "./Player"
import { Dude } from "./Dude"
import { NPC } from "./NPC"
import { DynamicEntityManager } from "../DynamicEntityManager"

export class DudeFactory {

    newPlayer(pos: Point) {
        return this.make("knight_f", pos, 
        "weapon_baton_with_spikes", 
        // "weapon_katana", 
        // "weapon_knife", 
        new Player())
    }

    newElf(pos: Point) {
        return this.make("elf_m", pos, "weapon_katana", new NPC())
    }

    newImp(pos: Point) {
        return this.make("skelet", pos, null, new NPC())
    }

    private make(archetype: string, pos: Point, weapon: string, ...additionalComponents: Component[]) {
        const e = new Entity([new Dude(archetype, pos, weapon) as Component].concat(additionalComponents))
        DynamicEntityManager.instance.add(e)
        return e.getComponent(Dude)
    }
}