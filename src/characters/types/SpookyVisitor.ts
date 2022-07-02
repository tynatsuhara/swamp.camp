import { Component, Point, StartData, UpdateData } from "brigsby/lib"
import { Lists } from "brigsby/lib/util"
import { Particles } from "../../graphics/particles/Particles"
import { Color } from "../../ui/Color"
import { Dude } from "../Dude"
import { NPC } from "../NPC"

export class SpookyVisitor extends Component {
    private npc: NPC
    private dude: Dude
    private position: Point

    start(startData: StartData) {
        this.npc = this.entity.getComponent(NPC)
        this.dude = this.entity.getComponent(Dude)
        emitAppiritionParticles(this.dude.standingPosition)
    }

    update(updateData: UpdateData) {
        this.position = this.dude.standingPosition

        if (this.npc.enemiesPresent) {
            this.entity.selfDestruct()
        }
    }

    delete() {
        emitAppiritionParticles(this.position)
        super.delete()
    }
}

const PARTICLE_COLORS = [Color.BLACK, Color.BLUE_1, Color.BLUE_2, Color.BLUE_3]

const emitAppiritionParticles = (position: Point) => {
    for (let i = 0; i < 150; i++) {
        const speed = Math.random() > 0.5 ? -0.005 : -0.004
        Particles.instance.emitParticle(
            Lists.oneOf(PARTICLE_COLORS),
            position.randomCircularShift(9).plusY(-7),
            position.y + 2,
            250 + Math.random() * 1000,
            (t) => new Point(0, t * speed),
            Math.random() > 0.5 ? new Point(2, 2) : new Point(1, 1)
        )
    }
}
