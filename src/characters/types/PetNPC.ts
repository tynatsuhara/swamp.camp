import { Component } from "brigsby/dist/Component"
import { Dude } from "../Dude"
import { NPC } from "../NPC"
import { Player } from "../Player"

export class PetNPC extends Component {
    awake() {
        const dude = this.entity.getComponent(Dude)
        const npc = this.entity.getComponent(NPC)

        npc.setLeader(Player.instance.dude)
    }
}
