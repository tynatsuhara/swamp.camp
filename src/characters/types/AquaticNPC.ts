import { Component } from "brigsby/dist"
import { now } from "../../world/WorldTime"
import { Ground } from "../../world/ground/Ground"
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
        const shouldBeVisible = now() < this.nextCanHideTime || this.isVisible()

        if (!anim.enabled && shouldBeVisible) {
            this.nextCanHideTime = now() + (1500 + Math.random() * 1000)
        }

        anim.enabled = shouldBeVisible
    }

    private isVisible() {
        const { location, tile, standingPosition } = this.dude

        // if not in the water, always visible
        if (!Ground.isWater(location, tile)) {
            return true
        }

        const enemy = this.npc.targetedEnemy
        return enemy && enemy.standingPosition.distanceTo(standingPosition) < VISIBLE_DISTANCE
    }
}
