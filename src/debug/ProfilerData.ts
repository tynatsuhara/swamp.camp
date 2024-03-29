import { Component, debug, profiler, pt } from "brigsby/dist"
import { Maths } from "brigsby/dist/util/Maths"
import { controls } from "../core/Controls"
import { pixelPtToTilePt } from "../graphics/Tilesets"
import { Particles } from "../graphics/particles/Particles"
import { TownStats } from "../world/TownStats"
import { WorldTime, now } from "../world/WorldTime"
import { here } from "../world/locations/LocationManager"
import { prettyPrint } from "./JSON"

/**
 * Updates the profiler with game scene data
 */
export class ProfilerData extends Component {
    update() {
        if (!debug.showProfiler || !debug.showBigProfiler) {
            return
        }

        const mouseTile = pixelPtToTilePt(controls.getWorldSpaceCursorPos())
        profiler.showInfo(`UI mouse pos: ${controls.getCursorPos().apply(Math.floor)}`)
        profiler.showInfo(`mouse tile: ${mouseTile}`)
        profiler.showInfo(`time: ${WorldTime.clockTime()} (${Math.floor(now())})`)
        profiler.showInfo(
            `particle count: ${Particles.instance.count} (${Particles.instance.inactiveCount} in pool)`
        )
        // profiler.showInfo(`level: ${here().getLevel(mouseTile)}`)
        profiler.showInfo(`stats: ${prettyPrint(TownStats.instance.getProfilerData())}`)

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
                    controls.getWorldSpaceCursorPos()
                )
            })
            .forEach((d) => {
                profiler.showInfo(`dude: ${prettyPrint(d.getProfilerData())}`)
                profiler.showInfo(`blob: ${prettyPrint(d.blob)}`)
            })
    }
}
