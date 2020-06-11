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
            // Villagers only consider demons enemies if the villager is out in the dark
            if (d.faction === DudeFaction.DEMONS) {
                return PointLightMaskRenderer.instance.getDarknessAtPosition(this.dude.standingPosition) !== 0
            }

            return d.faction !== DudeFaction.VILLAGERS
        }
    }
}