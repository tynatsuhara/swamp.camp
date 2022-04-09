import { Component } from "brigsby/dist/Component"
import { NPCSchedules } from "../ai/NPCSchedule"
import { NPC } from "../NPC"
import { Player } from "../Player"

export class PetNPC extends Component {
    awake() {
        const npc = this.entity.getComponent(NPC)

        npc.setLeader(Player.instance.dude)
        npc.setSchedule(NPCSchedules.newFollowLeaderSchedule())
    }
}
