import { Component, pt } from "brigsby/dist"
import { ElementType } from "../../world/elements/Elements"
import { Ground } from "../../world/ground/Ground"
import { LightManager } from "../../world/LightManager"
import { LocationType } from "../../world/locations/LocationManager"
import { NPCSchedules } from "../ai/NPCSchedule"
import { Dude } from "../Dude"
import { DudeFaction } from "../DudeFactory"
import { DudeType } from "../DudeType"
import { NPC } from "../NPC"
import { player } from "../player"
import { WeaponType } from "../weapons/WeaponType"
import { Centaur } from "./Centaur"
import { ShroomNPC } from "./ShroomNPC"

export class Villager extends Component {
    get npc() {
        return this.entity.getComponent(NPC)
    }
    get dude() {
        return this.entity.getComponent(Dude)
    }

    awake() {
        const { npc, dude } = this

        npc.isEnemyFn = (d) => {
            if (!d.entity) {
                // avoid weird null pointer
                return
            }

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
    }

    start() {
        const { npc, dude } = this

        if ([DudeType.GUMBALL, DudeType.ONION].includes(dude.type)) {
            npc.setLeader(player())
            npc.setSchedule(NPCSchedules.newFollowLeaderSchedule())
        } else if (dude.type === DudeType.DIP) {
            // TODO: Make this a more robust schedule
            const tentPos = dude.location.getElementOfType(ElementType.TENT).pos
            npc.setSchedule(NPCSchedules.newGoToSchedule(tentPos.plus(pt(3))))
        } else if ([DudeType.SPOOKY_VISITOR, DudeType.KNIGHT].includes(dude.type)) {
            npc.setSchedule(NPCSchedules.newFreeRoamSchedule())
        } else if (dude.type === DudeType.HERALD) {
            // no-op
        } else {
            npc.setSchedule(NPCSchedules.newDefaultVillagerSchedule())
            dude.doWhileLiving(
                () => {
                    // swing pickaxe randomly if working in the mines
                    if (
                        dude.weaponType === WeaponType.PICKAXE &&
                        dude.location.type === LocationType.MINE_INTERIOR
                    ) {
                        dude.updateAttacking(true)
                    }
                },
                2_000,
                Math.random() * 2_000
            )
        }
    }
}
