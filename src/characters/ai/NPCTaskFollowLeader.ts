import { TILE_SIZE } from "../../graphics/Tilesets"
import { NPC } from "../NPC"
import { NPCTask } from "./NPCTask"
import { NPCTaskContext } from "./NPCTaskContext"

export class NPCTaskFollowLeader extends NPCTask {
    performTask(context: NPCTaskContext) {
        const leader = context.dude.entity.getComponent(NPC).getLeader()
        const stoppingDistance = TILE_SIZE * 2
        if (
            !leader ||
            context.dude.standingPosition.distanceTo(leader.standingPosition) < stoppingDistance
        ) {
            context.doNothing()
        } else {
            context.walkTo(leader.tile)
        }
    }
}
