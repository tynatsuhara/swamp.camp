import { pt } from "brigsby/dist"
import { session } from "../../online/session"
import { NavMeshCollider } from "../../world/elements/NavMeshCollider"
import { NPCSchedules } from "../ai/NPCSchedule"
import { Dude } from "../Dude"
import { NPC } from "../NPC"
import { Enemy } from "./Enemy"

export class Mimic extends Enemy {
    awake() {
        super.awake()

        const dude = this.entity.getComponent(Dude)
        const npc = this.entity.getComponent(NPC)

        // add an extra collider since dude colliders don't collide with each other
        const collider = this.entity.addComponent(
            new NavMeshCollider(dude.location, dude.standingPosition.plus(pt(-7, -7)), pt(14, 6))
        )

        npc.isEnemyFn = () => false
        npc.setSchedule(NPCSchedules.newNoOpSchedule())

        dude.canBePushed = false

        // TODO attack onDamageCallback (needs to propagate attacker)
        // TODO fix interactable offset to make it match chests

        const trigger = (target: Dude) => {
            if (session.isHost()) {
                npc.isEnemyFn = (d) => d === target
                // attack right away
                npc.decideWhatToDoNext()

                dude.canBePushed = true

                collider.delete()
            }
        }

        dude.interactOverride = (interactor) => trigger(interactor)
    }
}
