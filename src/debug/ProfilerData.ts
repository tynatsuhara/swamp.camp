import { Component, debug, profiler, pt } from "brigsby/dist"
import { Maths } from "brigsby/dist/util/Maths"
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
            .filter((d) => {
                const hoverSize = pt(20, 20)
                return Maths.rectContains(
                    d.standingPosition.plus(pt(-hoverSize.x / 2, -hoverSize.y)),
                    hoverSize,
                    controls.getWorldSpaceMousePos()
                )
            })
            .forEach((d) => profiler.showInfo(`dude: ${prettyPrint(d.getProfilerData())}`))
    }
}
