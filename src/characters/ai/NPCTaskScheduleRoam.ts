import { Point } from "brigsby/dist/Point"
import { Lists } from "brigsby/dist/util/Lists"
import { pixelPtToTilePt, TILE_SIZE } from "../../graphics/Tilesets"
import { Ground } from "../../world/ground/Ground"
import { LightManager } from "../../world/LightManager"
import { DudeFaction } from "../DudeFactory"
import { NPCTask } from "./NPCTask"
import { NPCTaskContext } from "./NPCTaskContext"

export class NPCTaskScheduleRoam extends NPCTask {
    performTask(context: NPCTaskContext) {
        const { factions, location, standingPosition } = context.dude
        const tilePos = pixelPtToTilePt(standingPosition)

        const isLand = (pt: Point) => !Ground.isWater(location.getGround(pt)?.type)

        if (factions.includes(DudeFaction.DEMONS)) {
            context.roam(LightManager.instance.isDark(standingPosition, location) ? 0.5 : 1, {
                ptSelectionFilter: (pt) =>
                    isLand(pt) && LightManager.instance.isDark(pt.times(TILE_SIZE), location),
            })
        } else if (factions.includes(DudeFaction.AQUATIC)) {
            const inWater = Ground.isWater(location.getGround(tilePos)?.type)
            context.roam(inWater ? 1 : 0.2, {
                goalOptionsSupplier: () =>
                    this.getTilesAround(tilePos, inWater ? 5 : 15).filter((pt) => !isLand(pt)),
                pauseEveryMillis: inWater ? 2500 + 2500 * Math.random() : 0,
                pauseForMillis: inWater ? 2500 + 5000 * Math.random() : 0,
            })
        } else {
            context.roam(0.5, {
                ptSelectionFilter: isLand,
            })
        }
    }

    private getTilesAround(point: Point, range: number) {
        const shift = new Point(range / 2, range / 2).apply(Math.floor)

        return Lists.range(0, range)
            .flatMap((row) => Lists.range(0, range).map((col) => new Point(row, col)))
            .map((pt) => pt.plus(point).minus(shift))
    }
}
