import { WorldLocation } from "../WorldLocation"
import { LocationManager } from "../LocationManager"
import { AsciiInteriorBuilder } from "./AsciiInteriorBuilder"
import { GroundType } from "../ground/Ground"
import { Point } from "../../../engine/point"
import { Teleporter } from "../Teleporter"
import { TILE_SIZE, Tilesets } from "../../graphics/Tilesets"
import { ElementType } from "../elements/Elements"
import { NineSlice } from "../../../engine/tiles/NineSlice"
import { TentColor } from "../elements/Tent"

export const makeTentInterior = (outside: WorldLocation, color: TentColor): WorldLocation => {
    const l = LocationManager.instance.newLocation(true)

    const interactablePos = new Point(2.5, 4).times(TILE_SIZE)
    const teleporter: Teleporter = { to: outside.uuid, pos: interactablePos.plusY(-4) }
    l.addTeleporter(teleporter)
    l.addWorldElement(ElementType.TELEPORTER, new Point(2, 4), { to: outside.uuid, i: interactablePos.toString() })

    const groundType = color === TentColor.RED ? GroundType.TENT_RED : GroundType.TENT_BLUE
    
    NineSlice.nineSliceForEach(
        new Point(5, 4), 
        (pt, index) => l.addGroundElement(groundType, pt, { i: index })
    )

    return l
}