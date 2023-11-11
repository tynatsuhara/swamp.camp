import { Component } from "brigsby/dist"
import { CommonWorldSounds } from "../../audio/CommonWorldSounds"
import { SoundPool } from "../../audio/SoundPool"
import { Sounds } from "../../audio/Sounds"
import { session } from "../../online/session"
import { ConstructionSite } from "../../world/buildings/ConstructionSite"
import { Tree } from "../../world/elements/Tree"
import { GroundType } from "../../world/ground/Ground"
import { LocationType } from "../../world/locations/LocationType"
import { Dude } from "../Dude"
import { DudeType } from "../DudeType"
import { NPC } from "../NPC"
import { NPCSchedules } from "../ai/NPCSchedule"
import { VillagerJob } from "../ai/VillagerJob"
import { player } from "../player"
import { WeaponType } from "../weapons/WeaponType"

const DIG_SOUNDS = new SoundPool([
    ...[2, 3, 8, 9].map((i) => `audio/nature/Footstep/FootstepGrass0${i}.wav`),
    "audio/steps/gravel.ogg",
])

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
        this.npc.clearExistingAIState()
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
        } else if ([DudeType.SPOOKY_VISITOR, DudeType.KNIGHT].includes(dude.type)) {
            npc.setSchedule(NPCSchedules.newFreeRoamSchedule())
        } else if (dude.type === DudeType.HERALD || dude.type === DudeType.DIP) {
            // no-op
        } else {
            npc.setSchedule(NPCSchedules.newDefaultVillagerSchedule())
            this.initWorkEffects()
        }
    }

    private isMining() {
        return (
            this.dude.weaponType === WeaponType.PICKAXE &&
            this.dude.location.type === LocationType.MINE_INTERIOR
        )
    }
    private isDoingConstruction() {
        return (
            this.job ===
            this.dude.location.getElement(this.dude.tile)?.entity.getComponent(ConstructionSite)
                ?.jobType
        )
    }
    private isChoppingTrees() {
        return (
            this.dude.weaponType === WeaponType.AXE &&
            this.npc.isInteracting() &&
            this.npc.getInteractWithElement()?.entity?.getComponent(Tree)?.choppable
        )
    }

    private initWorkEffects() {
        this.dude.onAttackCallback = ({ hitEnemy, hitResource }) => {
            const { location, tile, standingPosition } = this.dude

            if (!hitEnemy && !hitResource) {
                if (this.isMining()) {
                    CommonWorldSounds.playMiningRock(standingPosition)
                } else if (this.isDoingConstruction()) {
                    Sounds.playAtPoint(DIG_SOUNDS.next(), 0.5, standingPosition)
                    const hittingTile = tile.plusX(this.dude.getFacingMultiplier())
                    // turn the ground to dirt
                    const ground = location.getGround(hittingTile)?.type
                    if (
                        ground === GroundType.GRASS &&
                        location.getElement(hittingTile)?.entity.getComponent(ConstructionSite)
                    ) {
                        location.setGroundElement(GroundType.PATH, hittingTile)
                    }
                }
            }
        }

        this.dude.doWhileLiving(() => {
            // swing pickaxe randomly if working in the mines
            if (this.isMining()) {
                this.dude.updateAttacking(true)
                return 2_000
            } else if (this.isDoingConstruction()) {
                this.dude.updateAttacking(true)
                return 2_000
            } else if (this.isChoppingTrees()) {
                this.dude.updateAttacking(true)
                return 1_500
            }

            return 2_000
        }, Math.random() * 2_000)
    }
}
