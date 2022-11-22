import { Component } from "brigsby/dist/Component"
import { StartData, UpdateData } from "brigsby/dist/Engine"
import { pt } from "brigsby/dist/Point"
import { Lists } from "brigsby/dist/util/Lists"
import { Particles } from "../../graphics/particles/Particles"
import { ShamanHealingParticles } from "../../graphics/particles/ShamanHealingParticles"
import { session } from "../../online/session"
import { here } from "../../world/locations/LocationManager"
import { NPCSchedules } from "../ai/NPCSchedule"
import { Dude } from "../Dude"
import { DudeFaction } from "../DudeFactory"
import { DudeType } from "../DudeType"
import { NPC } from "../NPC"

export class ShamanHealer extends Component {
    private dude: Dude
    private healTargets: Map<Dude, ShamanHealingParticles> = new Map()
    private selfParticles: ShamanHealingParticles

    start(startData: StartData): void {
        if (session.isGuest()) {
            return
        }

        this.dude = this.entity.getComponent(Dude)
        this.selfParticles = this.entity.addComponent(new ShamanHealingParticles())

        // TODO
        this.dude.entity.getComponent(NPC).setSchedule(NPCSchedules.newNoOpSchedule())

        this.dude.doWhileLiving(() => this.updateHealTargets(), 3_000)
        this.dude.doWhileLiving(() => this.doParticleEffects(), 100)
    }

    update({ elapsedTimeMillis }: UpdateData): void {
        if (session.isGuest()) {
            return
        }

        this.healTargets.forEach((_, dude) => {
            if (!dude.isAlive) {
                this.removeHealTarget(dude)
            } else {
                dude.heal(elapsedTimeMillis * 0.005)
            }
        })

        this.selfParticles.enabled = this.healTargets.size > 0
    }

    private doParticleEffects() {
        const centerOffset = -6
        this.healTargets.forEach((_, dude) => {
            // place some particles on the line between them, randomly shifted a bit
            const a = this.dude.standingPosition.plusY(centerOffset)
            const b = dude.standingPosition.plusY(centerOffset)
            const diff = b.minus(a)
            const particles = diff.magnitude() / 15
            for (let i = 0; i < particles; i++) {
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
