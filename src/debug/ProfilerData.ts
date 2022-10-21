import { Component, profiler, UpdateData } from "brigsby/dist"
import { controls } from "../Controls"
import { pixelPtToTilePt } from "../graphics/Tilesets"
import { here } from "../world/locations/LocationManager"
import { WorldTime } from "../world/WorldTime"

/**
 * Updates the profiler with game scene data
 */
export class ProfilerData extends Component {
    update(updateData: UpdateData): void {
        const mouseTile = pixelPtToTilePt(controls.getWorldSpaceMousePos())
        profiler.showInfo(`mouse tile: ${mouseTile}`)
        profiler.showInfo(`time: ${WorldTime.clockTime()} (${Math.floor(WorldTime.instance.time)})`)
        const elementData = here().getElement(mouseTile)?.save()
        if (elementData) {
            profiler.showInfo(
                `element data: ${JSON.stringify(elementData, null, " ").replace(
                    /"([^"]+)":/g,
                    "$1:"
                )}`
            )
        }
    }
}
