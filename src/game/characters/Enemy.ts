import { Component } from "../../engine/component"
import { Point } from "../../engine/point"
import { TILE_SIZE } from "../graphics/Tilesets"
import { PointLightMaskRenderer } from "../world/PointLightMaskRenderer"
import { Dude } from "./Dude"
import { DudeFaction } from "./DudeFactory"
import { NPC } from "./NPC"

export class Enemy extends Component {

    private dude: Dude
    private npc: NPC

    awake() {
        this.dude = this.entity.getComponent(Dude)
        this.npc = this.entity.getComponent(NPC)

        // DEMON enemies will avoid light
        // TODO make them burn in the light or something?
        if (this.dude.factions.includes(DudeFaction.DEMONS)) {
            this.npc.isEnemyFn = d => {
                return !d.factions.includes(DudeFaction.DEMONS) && PointLightMaskRenderer.instance.isDark(d.standingPosition)
            }
            this.npc.pathFindingHeuristic = (pt: Point, goal: Point) => {
                return pt.distanceTo(goal) + (PointLightMaskRenderer.instance.isDark(pt.times(TILE_SIZE)) ? 0 : 100)
            }
            this.npc.findTargetRange *= 3
        } else {
            this.npc.isEnemyFn = d => d.isEnemy(this.dude)
        }
    }

    update() {
        if (this.dude.weapon) {
            this.dude.weapon.setDelayBetweenAttacks(500)
        }
    }
}