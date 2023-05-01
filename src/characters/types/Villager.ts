import { Component, pt } from "brigsby/dist"
import { session } from "../../online/session"
import { ConstructionSite } from "../../world/buildings/ConstructionSite"
import { ElementType } from "../../world/elements/ElementType"
import { playMiningSound } from "../../world/elements/Rock"
import { Tree, playChoppingSound } from "../../world/elements/Tree"
import { GroundType } from "../../world/ground/Ground"
import { LocationType } from "../../world/locations/LocationType"
import { Dude } from "../Dude"
import { DudeType } from "../DudeType"
import { NPC } from "../NPC"
import { NPCSchedules } from "../ai/NPCSchedule"
import { VillagerJob } from "../ai/VillagerJob"
import { player } from "../player"
import { WeaponType } from "../weapons/WeaponType"

export class Villager extends Component {
    get npc() {
        return this.entity.getComponent(NPC)
    }

    get dude() {
        return this.entity.getComponent(Dude)
    }

    get job() {
        return this.npc.dude.blob["job"] as VillagerJob
    }
    set job(job: VillagerJob | undefined) {
        this.dude.blob["job"] = job
        this.npc.decideWhatToDoNext()
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
            this.initWorkAnimations()
        }
    }

    private initWorkAnimations() {
        this.dude.doWhileLiving(() => {
            const { weaponType, location, tile, standingPosition } = this.dude
            const isMining =
                weaponType === WeaponType.PICKAXE && location.type === LocationType.MINE_INTERIOR
            const isDoingConstruction =
                weaponType === WeaponType.HAMMER &&
                location.getElement(tile)?.entity.getComponent(ConstructionSite)
            const isChoppingTrees =
                weaponType === WeaponType.AXE &&
                this.npc.isInteracting() &&
                this.npc.getInteractWithElement()?.entity?.getComponent(Tree)?.choppable
            // swing pickaxe randomly if working in the mines
            if (isMining) {
                this.dude.updateAttacking(true)
                playMiningSound(standingPosition)
                return 2_000
            } else if (isDoingConstruction) {
                this.dude.updateAttacking(true)
                playChoppingSound(standingPosition)
                // turn the ground to dirt
                const hittingTile = tile.plusX(this.dude.getFacingMultiplier())
                const ground = location.getGround(hittingTile)?.type
                if (
                    ground === GroundType.GRASS &&
                    location.getElement(hittingTile)?.entity.getComponent(ConstructionSite)
                ) {
                    location.setGroundElement(GroundType.PATH, hittingTile)
                }
                return 2_000
            } else if (isChoppingTrees) {
                this.dude.updateAttacking(true)
                return 1_500
            }
            return 2_000
        }, Math.random() * 2_000)
    }
}
