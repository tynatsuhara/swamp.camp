import { Entity } from "../../engine/Entity"
import { Point } from "../../engine/point"
import { Component } from "../../engine/component"
import { Player } from "./Player"
import { Dude } from "./Dude"
import { NPC } from "./NPC"

export class DudeFactory {

    private readonly dudeEntities: Entity[] = []

    getSpawnedEntities() {
        return this.dudeEntities
    }

    newPlayer(pos: Point) {
        return this.make("knight_f", pos, new Player())
    }

    newElf(pos: Point) {
        return this.make("elf_m", pos, new NPC())
    }

    private make(archetype: string, pos: Point, ...additionalComponents: Component[]) {
        const e = new Entity([new Dude(archetype, pos) as Component].concat(additionalComponents))
        this.dudeEntities.push(e)
        return e.getComponent(Dude)
    }
}