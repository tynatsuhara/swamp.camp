import { Component } from "brigsby/dist/Component"
import { Dude } from "../Dude"
import { NPC } from "../NPC"
import { DudeFaction } from "../DudeFactory"
import { ShroomNPC } from "./ShroomNPC"
import { Centaur } from "./Centaur"
import { LightManager } from "../../world/LightManager"
import { Ground } from "../../world/ground/Ground"
import { pixelPtToTilePt } from "../../graphics/Tilesets"

export class Villager extends Component {
    awake() {
        const npc = this.entity.getComponent(NPC)
        const dude = this.entity.getComponent(Dude)

        npc.isEnemyFn = (d) => {
            // Villagers will only flee from demons if the villager is in the dark or really close to the demon
            if (d.factions.includes(DudeFaction.DEMONS)) {
                return (
                    LightManager.instance.isDark(dude.standingPosition) ||
                    d.standingPosition.distanceTo(dude.standingPosition) < 30
                )
            }

            // Villagers only flee from shrooms if the shroom is aggro
            if (d.factions.includes(DudeFaction.SHROOMS)) {
                return d.entity.getComponent(ShroomNPC).isAggro()
            }

            // Villagers only flee from centaurs if the centaur is aggro
            if (d.factions.includes(DudeFaction.CENTAURS)) {
                return d.entity.getComponent(Centaur).isAggro()
            }

            // Villagers only flee from acquatic creatures if they are in water
            if (d.factions.includes(DudeFaction.AQUATIC)) {
                return Ground.isWater(
                    dude.location.getGround(pixelPtToTilePt(dude.standingPosition))?.type
                )
            }

            return !d.factions.includes(DudeFaction.VILLAGERS)
        }
    }
}
