import { Point } from "brigsby/dist/Point"
import { TILE_SIZE } from "../../graphics/Tilesets"
import { ElementType } from "../elements/Elements"
import { ElementUtils } from "../elements/ElementUtils"
import { GroundType } from "../ground/Ground"
import { GroundRenderer } from "../GroundRenderer"
import { LocationManager } from "../LocationManager"
import { Teleporter, TeleporterPrefix } from "../Teleporter"
import { WorldLocation } from "../WorldLocation"
import { InteriorUtils } from "./InteriorUtils"

export const makeMineInterior = (outside: WorldLocation) => {
    const l = new WorldLocation(true, false)
    LocationManager.instance.add(l)

    const dimensions = new Point(3, 2)
    l.setBarriers(InteriorUtils.makeBarriers(dimensions))

    // background sprite
    l.sprites.addSprite(
        "mine-small", 
        new Point(0, -2 * TILE_SIZE), 
        0, 
        GroundRenderer.DEPTH
    )
    
    const interactablePos = new Point(dimensions.x/2, 0).times(TILE_SIZE)
    const teleporter: Teleporter = { 
        to: outside.uuid, 
        pos: interactablePos.plusY(12), 
        id: TeleporterPrefix.MINE 
    }
    l.addTeleporter(teleporter)

    l.addElement(
        ElementType.MINE_EXIT,
        new Point(1, 0),
        { 
            to: outside.uuid, 
            i: interactablePos.toString(),
            id: TeleporterPrefix.MINE
        }
    )

    // Indicate the open floor points so NPCs can roam
    ElementUtils.rectPoints(Point.ZERO, dimensions).forEach(pt => 
        l.setGroundElement(GroundType.BASIC, pt)
    )

    return l
}