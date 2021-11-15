import { Point } from "brigsby/dist/Point"
import { Lists } from "brigsby/dist/util/Lists"
import { pixelPtToTilePt, TILE_SIZE } from "../../graphics/Tilesets"
import { Ground } from "../../world/ground/Ground"
import { LightManager } from "../../world/LightManager"
import { DudeFaction, DudeType } from "../DudeFactory"
import { NPCSchedule, NPCScheduleType } from "./NPCSchedule"
import { NPCTask } from "./NPCTask"
import { NPCTaskContext } from "./NPCTaskContext"

export class NPCTaskScheduleRoam extends NPCTask {

    performTask(context: NPCTaskContext) {
        const { factions, location, standingPosition } = context.dude
        const tilePos = pixelPtToTilePt(standingPosition)

        if (factions.includes(DudeFaction.DEMONS)) {
            context.roam(
                LightManager.instance.isDark(standingPosition, location) ? 0.5 : 1,
                {
                    ptSelectionFilter: (pt) => LightManager.instance.isDark(pt.times(TILE_SIZE), location)
                }
            )
        } else if (factions.includes(DudeFaction.AQUATIC)) {
            context.roam(
                Ground.isWater(location.getGround(tilePos)?.type) ? 0.3 : 0.1,
                {
                    ptSelectionFilter: (pt) => Ground.isWater(location.getGround(pt)?.type),
                    goalOptionsSupplier: () => this.getTilesAround(tilePos, 5),
                    pauseEveryMillis: 2500 + 2500 * Math.random(),
                    pauseForMillis: 2500 + 5000 * Math.random(),
                }
            )
        } else {
            context.roam(0.5)
        }
    }

    private getTilesAround(point: Point, range: number) {
        const shift = new Point(range/2, range/2).apply(Math.floor)

        return Lists.range(0, range)
                .flatMap(row => Lists.range(0, range).map(col => new Point(row, col)))
                .map(pt => pt.plus(point).minus(shift))
    }
}