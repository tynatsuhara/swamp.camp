import { Component } from "../../engine/component"
import { UpdateData, StartData } from "../../engine/engine"
import { Dude } from "./Dude"
import { Point } from "../../engine/point"
import { LocationManager } from "../world/LocationManager"
import { TILE_SIZE } from "../graphics/Tilesets"
import { Lists } from "../../engine/util/Lists"
import { NPC } from "./NPC"

export class Enemy extends Component {

    private dude: Dude
    private npc: NPC

    private findTargetRange = TILE_SIZE * 10

    start(startData: StartData) {
        this.dude = this.entity.getComponent(Dude)
        this.dude.weapon.delay = 500
        this.npc = this.entity.getComponent(NPC)

        this.obtainTarget()
        const updateTargetInterval = setInterval(() => {
            if (!this.dude.isAlive) {
                clearInterval(updateTargetInterval)
            } else {
                this.obtainTarget()
            }
        }, 700 + 300 * Math.random())
    }

    obtainTarget() {
        let possibilities = Array.from(LocationManager.instance.currentLocation.dudes)
                .filter(d => d.faction != this.dude.faction)
                .filter(d => d.standingPosition.distanceTo(this.dude.standingPosition) < this.findTargetRange)
        
        // attack armed opponents first
        if (possibilities.some(d => !!d.weapon)) {
            possibilities = possibilities.filter(d => !!d.weapon)
        }

        const target = Lists.minBy(possibilities, d => d.position.distanceTo(this.dude.position))
        if (!!target) {
            this.npc.attack(target)
        }
    }
}