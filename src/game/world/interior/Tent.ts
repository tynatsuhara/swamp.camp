import { WorldLocation } from "../WorldLocation"
import { LocationManager } from "../LocationManager"
import { AsciiInteriorBuilder } from "./AsciiInteriorBuilder"
import { GroundType } from "../ground/Ground"
import { Point } from "../../../engine/point"
import { Teleporter } from "../Teleporter"
import { TILE_SIZE } from "../../graphics/Tilesets"
import { ElementType } from "../elements/Elements"

export const makeTentInterior = (outside: WorldLocation): WorldLocation => {
    const l = LocationManager.instance.newLocation()

    const interactablePos = new Point(2.5, 4).times(TILE_SIZE)
    const teleporter: Teleporter = { to: outside.uuid, pos: interactablePos.plusY(-2) }
    l.addTeleporter(teleporter)
    console.log("add teleporter")

    new AsciiInteriorBuilder(
        "_____",
        "_____",
        "_____",
        "_____",
    ).map("_", pos => {
        // TODO: make this the tent ground
        l.addGroundElement(GroundType.GRASS, pos)

        // TODO add an interior teleporter element
        l.addWorldElement(ElementType.TELEPORTER, new Point(2, 4), { to: outside.uuid, i: interactablePos.toString() })
    })

    return l
}