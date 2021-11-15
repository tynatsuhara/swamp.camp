import { Component } from "brigsby/dist/Component"
import { Camera } from "../../cutscenes/Camera"
import { pixelPtToTilePt } from "../../graphics/Tilesets"
import { Ground } from "../../world/ground/Ground"
import { WorldTime } from "../../world/WorldTime"
import { Dude } from "../Dude"
import { DudeType } from "../DudeFactory"
import { NPC } from "../NPC"

const VISIBLE_DISTANCE = 24
const SHAKE_DISTANCE = VISIBLE_DISTANCE * 2

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

        // TODO: maybe shake when approaching?
        // if (!anim.enabled 
        //         && this.npc.targetedEnemy?.type === DudeType.PLAYER 
        //         && this.npc.targetedEnemy.standingPosition.distanceTo(this.dude.standingPosition) < SHAKE_DISTANCE) {
        //     Camera.instance.shake(1.5, 200)
        // } 
    }

    private isVisible() {
        // if not in the water, always visible
        if (!Ground.isWater(this.dude.location.getGround(pixelPtToTilePt(this.dude.standingPosition))?.type)) {
            return true
        }

        const enemy = this.npc.targetedEnemy
        return enemy && enemy.standingPosition.distanceTo(this.dude.standingPosition) < VISIBLE_DISTANCE
    }
}