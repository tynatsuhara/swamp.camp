import { Component } from "../../engine/component"
import { Dude } from "./Dude"
import { NPC } from "./NPC"
import { DudeFaction } from "./DudeFactory"

export class Villager extends Component {
    
    private npc: NPC

    awake() {
        this.npc = this.entity.getComponent(NPC)
        this.npc.isEnemyFn = d => d.faction !== DudeFaction.VILLAGERS
    }
}