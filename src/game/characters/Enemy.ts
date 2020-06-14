import { Component } from "../../engine/component"
import { Dude } from "./Dude"
import { NPC } from "./NPC"
import { DudeFaction } from "./DudeFactory"
import { PointLightMaskRenderer } from "../world/PointLightMaskRenderer"
import { Point } from "../../engine/point"
import { TILE_SIZE } from "../graphics/Tilesets"

export class Enemy extends Component {

    private dude: Dude
    private npc: NPC

    awake() {
        this.dude = this.entity.getComponent(Dude)
        this.dude.weapon.setDelayBetweenAttacks(500)

        this.npc = this.entity.getComponent(NPC)

        // DEMON enemies will avoid light
        // TODO make them burn in the light or something?
        if (this.dude.faction === DudeFaction.DEMONS) {
            this.npc.isEnemyFn = d => d.faction != this.dude.faction && PointLightMaskRenderer.instance.getDarknessAtPosition(d.standingPosition) > 150
            this.npc.pathFindingHeuristic = (pt: Point, goal: Point) => {
                return pt.distanceTo(goal) + (255 - PointLightMaskRenderer.instance.getDarknessAtPosition(pt.times(TILE_SIZE)))
            }
            this.npc.findTargetRange *= 3
        } else {
            this.npc.isEnemyFn = d => d.faction != this.dude.faction
        }
    }
}