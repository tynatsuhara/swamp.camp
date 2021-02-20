import { WorldLocation } from "../WorldLocation"
import { LocationManager } from "../LocationManager"
import { GroundType } from "../ground/Ground"
import { Point } from "../../../engine/point"
import { Teleporter } from "../Teleporter"
import { TILE_SIZE } from "../../graphics/Tilesets"
import { ElementType } from "../elements/Elements"
import { NineSlice } from "../../../engine/tiles/NineSlice"
import { TentColor } from "../elements/Tent"
import { AsciiInteriorBuilder } from "./AsciiInteriorBuilder"
import { InteriorUtils } from "./InteriorUtils"

export const makeTentInterior = (outside: WorldLocation, color: TentColor): WorldLocation => {
    const isPlayerTent = color === TentColor.BLUE
    const l = new WorldLocation(true, isPlayerTent)
    LocationManager.instance.add(l)

    const floorDimensions = new Point(5, 4)
    
    l.setBarriers(InteriorUtils.makeBarriers(floorDimensions))

    const interactablePos = new Point(2.5, 4).times(TILE_SIZE)
    const teleporter: Teleporter = { to: outside.uuid, pos: interactablePos.plusY(-4) }
    l.addTeleporter(teleporter)
    l.addElement(ElementType.TELEPORTER, new Point(2, 4), { to: outside.uuid, i: interactablePos.toString() })

    const groundType = `${color}tentInterior`
    
    NineSlice.nineSliceForEach(
        floorDimensions, 
        (pt, index) => l.addGroundElement(GroundType.BASIC_NINE_SLICE, pt, { k: groundType, i: index })
    )

    new AsciiInteriorBuilder(
        "  ^  ",
        " /xl ",
        "/xxxl",
    ).map("/", pt => { l.addGroundElement(GroundType.BASIC, pt.plusY(-3), { k: `${color}tentl` })})
    .map("^", pt => { l.addGroundElement(GroundType.BASIC, pt.plusY(-3), { k: `${color}tenttip` })})
    .map("l", pt => { l.addGroundElement(GroundType.BASIC, pt.plusY(-3), { k: `${color}tentr` })})
    .map("x", pt => { l.addGroundElement(GroundType.BASIC, pt.plusY(-3), { k: `${color}tentCenter` })})

    return l
}