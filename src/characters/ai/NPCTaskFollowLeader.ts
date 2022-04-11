import { Lists } from "brigsby/dist/util/Lists"
import { TILE_SIZE } from "../../graphics/Tilesets"
import { NPC } from "../NPC"
import { NPCTask } from "./NPCTask"
import { NPCTaskContext } from "./NPCTaskContext"

export class NPCTaskFollowLeader extends NPCTask {
    performTask(context: NPCTaskContext) {
        const leader = context.dude.entity.getComponent(NPC).getLeader()
        const stoppingDistance = TILE_SIZE * 2
        if (!leader) {
            context.doNothing()
            return
        }

        // TODO: Follow inside

        const t = leader.tile
        const options = [t.plusX(1), t.plusX(-1), t.plusY(1), t.plusY(-1)]
        if (
            options.length === 0 ||
            context.dude.standingPosition.distanceTo(leader.standingPosition) < stoppingDistance
        ) {
            context.doNothing()
            return
        }

        const position = Lists.oneOf(options.filter((p) => !context.dude.location.isOccupied(p)))
        context.walkTo(position)
    }
}
