import { WorldLocation } from "../WorldLocation"
import { LocationManager } from "../LocationManager"
import { AsciiInteriorBuilder } from "./AsciiInteriorBuilder"
import { GroundType } from "../ground/Ground"

export const makeTentInterior = (): WorldLocation => {
    const l = LocationManager.instance.newLocation()

    new AsciiInteriorBuilder(
        "_____",
        "_____",
        "_____",
        "_____",
    ).map("_", pos => {
        // TODO: make this the tent ground
        l.addGroundElement(GroundType.GRASS, pos)

        // TODO: add exit teleporter
    })

    return l
}