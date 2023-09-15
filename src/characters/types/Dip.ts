import { Component } from "brigsby/dist"
import { session } from "../../online/session"
import { NPC } from "../NPC"
import { NPCSchedules } from "../ai/NPCSchedule"

export class Dip extends Component {
    private npc: NPC

    constructor() {
        super()
    }

    awake() {
        this.npc = this.entity.getComponent(NPC)
    }

    start() {
        if (session.isGuest()) {
            return
        }

        // wait until start() since schedule relies on the EventQueue and locations being initialized
        this.npc.setSchedule(NPCSchedules.newDefaultVillagerSchedule())
    }
}
