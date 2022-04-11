import { Component } from "brigsby/dist/Component"
import { Point } from "brigsby/dist/Point"
import { Ground } from "../../world/ground/Ground"
import { LightManager } from "../../world/LightManager"
import { NPCSchedules } from "../ai/NPCSchedule"
import { Dude } from "../Dude"
import { DudeFaction, DudeType } from "../DudeFactory"
import { NPC } from "../NPC"
import { Player } from "../Player"
import { Centaur } from "./Centaur"
import { ShroomNPC } from "./ShroomNPC"

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
                return Ground.isWater(dude.location.getGround(dude.tile)?.type)
            }

            return !d.factions.includes(DudeFaction.VILLAGERS)
        }

        if (dude.type === DudeType.GUMBALL || dude.type === DudeType.ONION) {
            npc.setLeader(Player.instance.dude)
            npc.setSchedule(NPCSchedules.newFollowLeaderSchedule())
        } else if (dude.type === DudeType.DIP) {
            npc.setSchedule(NPCSchedules.newGoToSchedule(new Point(0, 0)))
        } else if (dude.type === DudeType.SPOOKY_VISITOR) {
            npc.setSchedule(NPCSchedules.newFreeRoamSchedule())
        } else if (dude.type !== DudeType.HERALD) {
            npc.setSchedule(NPCSchedules.newDefaultVillagerSchedule())
        }
    }
}
