import { Component, debug, profiler } from "brigsby/dist"
import { DudeType } from "../characters/DudeType"
import { controls } from "../Controls"
import { pixelPtToTilePt } from "../graphics/Tilesets"
import { here } from "../world/locations/LocationManager"
import { WorldTime } from "../world/WorldTime"
import { prettyPrint } from "./JSON"

/**
 * Updates the profiler with game scene data
 */
export class ProfilerData extends Component {
    update() {
        if (!debug.showProfiler) {
            return
        }

        const mouseTile = pixelPtToTilePt(controls.getWorldSpaceMousePos())
        profiler.showInfo(`UI mouse pos: ${controls.getMousePos().apply(Math.floor)}`)
        profiler.showInfo(`mouse tile: ${mouseTile}`)
        profiler.showInfo(`time: ${WorldTime.clockTime()} (${Math.floor(WorldTime.instance.time)})`)

        const elementData = here().getElement(mouseTile)?.save()
        if (elementData) {
            profiler.showInfo(`element data: ${prettyPrint(elementData)}`)
        }

        here()
            .getDudes()
            .filter((d) => d.isPointIntersectingCollider(controls.getWorldSpaceMousePos()))
            .forEach((d) =>
                profiler.showInfo(
                    `dude: ${prettyPrint({
                        uuid: d.uuid,
                        health: +d.health.toFixed(2),
                        type: DudeType[d.type],
                    })}`
                )
            )
    }
}
