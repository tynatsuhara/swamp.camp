import { pt, StartData } from "brigsby/dist"
import { session } from "../../online/session"
import { Interactable } from "../../world/elements/Interactable"
import { NavMeshCollider } from "../../world/elements/NavMeshCollider"
import { NPCSchedules } from "../ai/NPCSchedule"
import { Dude } from "../Dude"
import { NPC } from "../NPC"
import { player } from "../player/index"
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

        const interactable = this.entity.addComponent(
            new Interactable(
                dude.standingPosition.plusY(-5),
                (interactor) => trigger(interactor),
                pt(0, -18),
                (interactor) => interactor === player()
            )
        )

        dude.canBePushed = false
        npc.isEnemyFn = () => false
        npc.setSchedule(NPCSchedules.newNoOpSchedule())

        // TODO enemies will attack the mimic by default...

        const trigger = (target: Dude) => {
            if (session.isHost()) {
                dude.canBePushed = true
                npc.isEnemyFn = (d) => d === target
                // attack right away
                npc.decideWhatToDoNext()
                collider.delete()
                interactable.delete()
            }
        }

        dude.setOnDamageCallback((_, attacker) => trigger(attacker))
    }

    start(startData: StartData): void {
        const interactable = this.entity.getComponent(Interactable)
        interactable.uiOffset = interactable.uiOffset.plusY(7)
    }
}
