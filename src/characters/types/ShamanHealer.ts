import { Component } from "brigsby/dist/Component"
import { StartData, UpdateData } from "brigsby/dist/Engine"
import { ShamanHealingParticles } from "../../graphics/particles/ShamanHealingParticles"
import { Color } from "../../ui/Color"
import { here } from "../../world/locations/LocationManager"
import { NPCSchedules } from "../ai/NPCSchedule"
import { Dude } from "../Dude"
import { DudeFaction } from "../DudeFactory"
import { DudeType } from "../DudeType"
import { NPC } from "../NPC"

const DRIFT_DISTANCE = 1
const COLORS = [Color.BLUE_5, Color.BLUE_6]

export class ShamanHealer extends Component {
    private dude: Dude
    private healTargets: Map<Dude, ShamanHealingParticles> = new Map()

    start(startData: StartData): void {
        this.dude = this.entity.getComponent(Dude)

        // TODO
        this.dude.entity.getComponent(NPC).setSchedule(NPCSchedules.newNoOpSchedule())

        // particles on shaman
        this.entity.addComponent(new ShamanHealingParticles())

        this.dude.doWhileLiving(() => this.updateHealTargets(), 3_000)
    }

    update({ elapsedTimeMillis }: UpdateData) {
        // dude.heal(elapsedTimeMillis * 0.001) // TODO rate
    }

    private updateHealTargets() {
        const maxTileDistance = 8
        const maxHealTargets = 5
        const newHealTargets = here()
            .getDudes()
            .filter(
                (d) => d.factions.includes(DudeFaction.GNOLLS) && d.type !== DudeType.GNOLL_SHAMAN
            )
            .filter((dude) => dude.tile.distanceTo(this.dude.tile) < maxTileDistance)
            .sort((a, b) => a.tile.distanceTo(this.dude.tile) - b.tile.distanceTo(this.dude.tile))
            .slice(0, maxHealTargets)

        this.healTargets.forEach((_, dude) => {
            if (!newHealTargets.includes(dude)) {
                this.removeHealTarget(dude)
            }
        })

        newHealTargets.forEach((dude) => {
            if (!this.healTargets.has(dude)) {
                this.addHealTarget(dude)
            }
        })
    }

    private addHealTarget(dude: Dude) {
        const particles = dude.entity.addComponent(new ShamanHealingParticles())
        this.healTargets.set(dude, particles)
    }

    private removeHealTarget(dude: Dude) {
        const particles = this.healTargets.get(dude)
        dude.entity.removeComponent(particles)
        this.healTargets.delete(dude)
    }

    delete() {
        this.healTargets.forEach((_, dude) => {
            this.removeHealTarget(dude)
        })
    }
}
