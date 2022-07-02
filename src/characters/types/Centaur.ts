import { Component } from "brigsby/dist"
import { GenericDialogue } from "../dialogue/GenericDialogue"
import { Dude } from "../Dude"
import { DudeFaction } from "../DudeFactory"
import { NPC } from "../NPC"

export class Centaur extends Component {
    private npc: NPC
    private dude: Dude

    awake() {
        this.npc = this.entity.getComponent(NPC)
        this.dude = this.entity.getComponent(Dude)

        this.dude.dialogue = GenericDialogue.HELLO

        this.npc.isEnemyFn = (d) => {
            // TODO: Make centaurs potential enemies
            return (
                !d.factions.includes(DudeFaction.CENTAURS) &&
                !d.factions.includes(DudeFaction.VILLAGERS)
            )
        }
    }

    isAggro(): boolean {
        // TODO: Make centaurs potential enemies
        return false
    }
}
