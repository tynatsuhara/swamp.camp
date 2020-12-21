import { Component } from "../../engine/component"
import { Dude } from "./Dude"
import { NPC } from "./NPC"
import { DudeFaction } from "./DudeFactory"
import { PointLightMaskRenderer } from "../world/PointLightMaskRenderer"

export class Villager extends Component {
    
    private npc: NPC
    private dude: Dude

    awake() {
        this.npc = this.entity.getComponent(NPC)
        this.dude = this.entity.getComponent(Dude)

        this.npc.isEnemyFn = d => {
            // Villagers will only flee from demons if the villager is in the dark or really close to the demon
            if (d.factions.includes(DudeFaction.DEMONS)) {
                return PointLightMaskRenderer.instance.isDark(this.dude.standingPosition)
                        || d.standingPosition.distanceTo(this.dude.standingPosition) < 30
            }

            return !d.factions.includes(DudeFaction.VILLAGERS)
        }
    }
}