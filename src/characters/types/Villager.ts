import { Component } from "brigsby/dist/Component"
import { Point } from "brigsby/dist/Point"
import { Ground } from "../../world/ground/Ground"
import { LightManager } from "../../world/LightManager"
import { NPCSchedules } from "../ai/NPCSchedule"
import { Dude } from "../Dude"
import { DudeFaction, DudeType } from "../DudeFactory"
import { NPC } from "../NPC"
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

        // TODO figure out how to set these up properly
        if (dude.type === DudeType.DIP) {
            npc.setSchedule(NPCSchedules.newGoToSchedule(new Point(0, 0)))
        } else if (dude.type === DudeType.HERALD) {
            // TODO: Fix this to be dynamic
            npc.setSchedule(NPCSchedules.newGoToSchedule(new Point(0, 0)))

            // currently the HERALD events change his schedule so we need to reconcile that

            // NPCSchedules.newGoToSchedule(
            //     // filter out occupied points to not get stuck in the campfire
            //     Lists.oneOf(
            //         [new Point(-3, 0), new Point(-3, 1), new Point(-2, 0), new Point(-2, 1)].filter(
            //             (pt) => !location.isOccupied(pt)
            //         )
            //     )
            // )
        } else {
            npc.setSchedule(NPCSchedules.newDefaultVillagerSchedule())
        }
    }
}
