import { session } from "../../online/session"
import { NPCSchedules } from "../ai/NPCSchedule"
import { Dude } from "../Dude"
import { NPC } from "../NPC"
import { Enemy } from "./Enemy"

export class Mimic extends Enemy {
    awake() {
        super.awake()

        const dude = this.entity.getComponent(Dude)
        const npc = this.entity.getComponent(NPC)

        npc.isEnemyFn = () => false

        npc.setSchedule(NPCSchedules.newNoOpSchedule())

        dude.interactOverride = (interactor) => {
            if (session.isHost()) {
                npc.isEnemyFn = (d) => d === interactor
                // attack right away
                npc.decideWhatToDoNext()
            }
        }
    }
}
