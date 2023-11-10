import { Component, pt } from "brigsby/dist"
import { session } from "../../online/session"
import { Interactable } from "../../world/elements/Interactable"
import { NavMeshCollider } from "../../world/elements/NavMeshCollider"
import { Dude } from "../Dude"
import { NPC } from "../NPC"
import { NPCSchedules } from "../ai/NPCSchedule"
import { player } from "../player/index"
import { Enemy } from "./Enemy"

const TRIGGERED = "triggered"

export class Mimic extends Component {
    private trigger: () => void

    awake() {
        const dude = this.entity.getComponent(Dude)
        const npc = this.entity.getComponent(NPC)

        // add an extra collider since dude colliders don't collide with each other
        const collider = this.entity.addComponent(
            new NavMeshCollider(dude.location, dude.standingPosition.plus(pt(-7, -7)), pt(14, 6))
        )

        const interactable = this.entity.addComponent(
            new Interactable(
                dude.standingPosition.plusY(-5),
                () => this.trigger(),
                pt(0, -18),
                (interactor) => interactor === player()
            )
        )

        dude.canBePushed = false
        npc.isEnemyFn = () => false
        npc.setSchedule(NPCSchedules.newNoOpSchedule())

        this.trigger = () => {
            if (session.isHost()) {
                dude.canBePushed = true
                this.entity.addComponent(new Enemy())
                // attack right away
                npc.decideWhatToDoNext()
                collider.delete()
                interactable.delete()
                dude.blob[TRIGGERED] = true
            }
        }

        dude.setOnDamageCallback(() => this.trigger())
    }

    start() {
        const interactable = this.entity.getComponent(Interactable)
        interactable.uiOffset = interactable.uiOffset.plusY(7)

        // use serialized triggered state
        if (Mimic.isTriggered(this.entity.getComponent(Dude).blob)) {
            this.trigger()
        }
    }

    static isTriggered(blob: object) {
        return !!blob[TRIGGERED]
    }
}
