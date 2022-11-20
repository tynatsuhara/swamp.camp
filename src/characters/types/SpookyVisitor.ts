import { Component, Point, StartData, UpdateData } from "brigsby/dist"
import { emitApparitionParticles } from "../../graphics/particles/ApparitionParticles"
import { session } from "../../online/session"
import { Dude } from "../Dude"
import { NPC } from "../NPC"

export class SpookyVisitor extends Component {
    private npc: NPC
    private dude: Dude
    private position: Point

    start(startData: StartData) {
        this.npc = this.entity.getComponent(NPC)
        this.dude = this.entity.getComponent(Dude)
        emitApparitionParticles(this.dude.standingPosition)
    }

    update(updateData: UpdateData) {
        // MPTODO
        if (session.isGuest()) {
            return
        }

        this.position = this.dude.standingPosition

        if (this.npc.enemiesPresent) {
            this.entity.selfDestruct()
        }
    }

    delete() {
        emitApparitionParticles(this.position)
        super.delete()
    }
}
