import { Component } from "../../engine/component"
import { Dude } from "./Dude"
import { NPC } from "./NPC"
import { DudeFaction } from "./DudeFactory"

export class Villager extends Component {
    
    private dude: Dude
    private npc: NPC

    awake() {
        this.dude = this.entity.getComponent(Dude)
        this.npc = this.entity.getComponent(NPC)
        this.npc.isEnemyFn = d => d.faction !== DudeFaction.VILLAGERS
    }
}