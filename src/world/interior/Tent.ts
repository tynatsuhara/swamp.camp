import { Point } from "brigsby/dist/Point"
import { NineSlice } from "brigsby/dist/sprites/NineSlice"
import { TILE_SIZE } from "../../graphics/Tilesets"
import { ElementType } from "../elements/Elements"
import { TentColor } from "../elements/Tent"
import { GroundType } from "../ground/Ground"
import { Location } from "../Location"
import { LocationManager, LocationType } from "../LocationManager"
import { Teleporter, TeleporterPrefix } from "../Teleporter"
import { AsciiInteriorBuilder } from "./AsciiInteriorBuilder"
import { InteriorUtils } from "./InteriorUtils"

export const makeTentInterior = (outside: Location, color: TentColor): Location => {
    const isPlayerTent = color === TentColor.BLUE
    const l = new Location(LocationType.TENT_INTERIOR, true, isPlayerTent)
    LocationManager.instance.add(l)

    const floorDimensions = new Point(5, 4)

    l.setBarriers(InteriorUtils.makeBarriers(floorDimensions))

    const interactablePos = new Point(2.5, 4).times(TILE_SIZE)
    const teleporter: Teleporter = {
        to: outside.uuid,
        pos: interactablePos.plusY(-4),
        id: TeleporterPrefix.TENT,
    }
    l.addTeleporter(teleporter)
    l.addElement(ElementType.TELEPORTER, new Point(2, 4), {
        to: outside.uuid,
        i: interactablePos.toString(),
        id: TeleporterPrefix.TENT,
    })

    if (!isPlayerTent) {
        l.addElement(ElementType.BED, new Point(3, 0))
    }

    const groundType = `${color}tentInterior`

    NineSlice.nineSliceForEach(floorDimensions, (pt, index) =>
        l.setGroundElement(GroundType.BASIC_NINE_SLICE, pt, {
            k: groundType,
            i: index,
        })
    )

    const addWallSprite = (key: string, pt: Point) => {
        l.sprites.addSprite(key, pt.plusY(-3).times(TILE_SIZE), 0, -100000)
    }

    new AsciiInteriorBuilder("  ^  ", " /xl ", "/xxxl")
        .map("/", (pt) => addWallSprite(`${color}tentl`, pt))
        .map("^", (pt) => addWallSprite(`${color}tenttip`, pt))
        .map("l", (pt) => addWallSprite(`${color}tentr`, pt))
        .map("x", (pt) => addWallSprite(`${color}tentCenter`, pt))

    return l
}
