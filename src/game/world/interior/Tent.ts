import { WorldLocation } from "../WorldLocation"
import { LocationManager } from "../LocationManager"
import { GroundType } from "../ground/Ground"
import { Point } from "../../../engine/point"
import { Teleporter, TeleporterPrefix } from "../Teleporter"
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
    const teleporter: Teleporter = { 
        to: outside.uuid, 
        pos: interactablePos.plusY(-4), 
        id: TeleporterPrefix.TENT 
    }
    l.addTeleporter(teleporter)
    l.addElement(
        ElementType.TELEPORTER, 
        new Point(2, 4), 
        { 
            to: outside.uuid, 
            i: interactablePos.toString(), 
            id: TeleporterPrefix.TENT 
        }
    )

    const groundType = `${color}tentInterior`
    
    NineSlice.nineSliceForEach(
        floorDimensions, 
        (pt, index) => l.addGroundElement(GroundType.BASIC_NINE_SLICE, pt, { k: groundType, i: index })
    )

    const addWallSprite = (key: string, pt: Point) => {
        l.sprites.addSprite(key, pt.plusY(-3).times(TILE_SIZE), 0, -100000)
    }

    new AsciiInteriorBuilder(
        "  ^  ",
        " /xl ",
        "/xxxl",
    ).map("/", pt => addWallSprite(`${color}tentl`, pt))
    .map("^", pt => addWallSprite(`${color}tenttip`, pt))
    .map("l", pt => addWallSprite(`${color}tentr`, pt))
    .map("x", pt => addWallSprite(`${color}tentCenter`, pt))

    return l
}