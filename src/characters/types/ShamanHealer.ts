import { Component } from "brigsby/dist/Component"
import { StartData, UpdateData } from "brigsby/dist/Engine"
import { pt } from "brigsby/dist/Point"
import { Lists } from "brigsby/dist/util/Lists"
import { Particles } from "../../graphics/particles/Particles"
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

        this.dude.doWhileLiving(() => this.doParticleEffects(), 100)
    }

    update({ elapsedTimeMillis }: UpdateData): void {
        this.healTargets.forEach((_, dude) => {
            if (!dude.isAlive) {
                this.removeHealTarget(dude)
            } else {
                dude.heal(elapsedTimeMillis * 0.005)
            }
        })
    }

    doParticleEffects() {
        const centerOffset = -6
        this.healTargets.forEach((_, dude) => {
            // place some particles on the line between them, randomly shifted a bit
            const a = this.dude.standingPosition.plusY(centerOffset)
            const b = dude.standingPosition.plusY(centerOffset)
            const diff = b.minus(a)
            for (let i = 0; i < 5; i++) {
                const midpoint = a.plus(diff.times(Math.random()))
                Particles.instance.emitParticle(
                    Lists.oneOf(ShamanHealingParticles.PARTICLE_COLORS),
                    midpoint.randomCircularShift(5),
                    midpoint.y - centerOffset,
                    400 + Math.random() * 400,
                    () => pt(0, -0.008),
                    pt(Math.random() > 0.5 ? 1 : 2)
                )
            }
        })
    }

    private updateHealTargets() {
        const maxTileDistance = 15
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
