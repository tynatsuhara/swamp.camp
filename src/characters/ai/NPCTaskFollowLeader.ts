import { Lists } from "brigsby/dist/util/Lists"
import { TILE_SIZE } from "../../graphics/Tilesets"
import { NPC } from "../NPC"
import { NPCTask } from "./NPCTask"
import { NPCTaskContext } from "./NPCTaskContext"

export class NPCTaskFollowLeader extends NPCTask {
    performTask(context: NPCTaskContext) {
        const { dude } = context
        const leader = dude.entity.getComponent(NPC).getLeader()
        const stoppingDistance = TILE_SIZE * 2
        if (!leader) {
            context.doNothing()
            return
        }

        if (leader.location !== dude.location) {
            context.goToLocation(leader.location)
            return
        }

        const t = leader.tile
        const options = [t.plusX(1), t.plusX(-1), t.plusY(1), t.plusY(-1)].filter(
            (p) => !dude.location.isOccupied(p)
        )

        if (
            options.length === 0 ||
            (dude.standingPosition.distanceTo(leader.standingPosition) < stoppingDistance &&
                !dude.tile.equals(leader.tile))
        ) {
            context.doNothing()
            return
        }

        const position = Lists.oneOf(options)
        context.walkTo(position)
    }
}
