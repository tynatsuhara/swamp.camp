import { Component, pt } from "brigsby/dist"
import { session } from "../../online/session"
import { ConstructionSite } from "../../world/buildings/ConstructionSite"
import { ElementType } from "../../world/elements/Elements"
import { playMiningSound } from "../../world/elements/Rock"
import { playChoppingSound } from "../../world/elements/Tree"
import { LocationType } from "../../world/locations/LocationManager"
import { NPCSchedules } from "../ai/NPCSchedule"
import { Dude } from "../Dude"
import { DudeType } from "../DudeType"
import { NPC } from "../NPC"
import { player } from "../player"
import { WeaponType } from "../weapons/WeaponType"

export class Villager extends Component {
    get npc() {
        return this.entity.getComponent(NPC)
    }
    get dude() {
        return this.entity.getComponent(Dude)
    }

    start() {
        if (session.isGuest()) {
            return
        }

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
            dude.doWhileLiving(() => {
                const isMining =
                    dude.weaponType === WeaponType.PICKAXE &&
                    dude.location.type === LocationType.MINE_INTERIOR
                const isDoingConstruction =
                    dude.weaponType === WeaponType.HAMMER &&
                    dude.location.getElement(dude.tile)?.entity.getComponent(ConstructionSite)
                // swing pickaxe randomly if working in the mines
                if (isMining) {
                    dude.updateAttacking(true)
                    playMiningSound(dude.standingPosition)
                } else if (isDoingConstruction) {
                    dude.updateAttacking(true)
                    playChoppingSound(dude.standingPosition)
                }
                return 2_000
            }, Math.random() * 2_000)
        }
    }
}
