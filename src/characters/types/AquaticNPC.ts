import { Component } from "brigsby/dist/Component"
import { Ground } from "../../world/ground/Ground"
import { WorldTime } from "../../world/WorldTime"
import { Dude } from "../Dude"
import { NPC } from "../NPC"

const VISIBLE_DISTANCE = 24

export class AquaticNPC extends Component {
    private npc: NPC
    private dude: Dude
    private nextCanHideTime = 0

    awake() {
        this.npc = this.entity.getComponent(NPC)
        this.dude = this.entity.getComponent(Dude)
    }

    update() {
        const anim = this.dude.animation
        const shouldBeVisible = WorldTime.instance.time < this.nextCanHideTime || this.isVisible()

        if (!anim.enabled && shouldBeVisible) {
            this.nextCanHideTime = WorldTime.instance.time + (1500 + Math.random() * 1000)
        }

        anim.enabled = shouldBeVisible
    }

    private isVisible() {
        // if not in the water, always visible
        if (!Ground.isWater(this.dude.location.getGround(this.dude.tile)?.type)) {
            return true
        }

        const enemy = this.npc.targetedEnemy
        return (
            enemy &&
            enemy.standingPosition.distanceTo(this.dude.standingPosition) < VISIBLE_DISTANCE
        )
    }
}
