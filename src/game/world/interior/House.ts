import { Point } from "../../../engine/point"
import { TILE_SIZE } from "../../graphics/Tilesets"
import { ElementType } from "../elements/Elements"
import { GroundType } from "../ground/Ground"
import { LocationManager } from "../LocationManager"
import { Teleporter } from "../Teleporter"
import { WorldLocation } from "../WorldLocation"
import { InteriorUtils } from "./InteriorUtils"

export const makeHouseInterior = (outside: WorldLocation): WorldLocation => {
    const l = new WorldLocation(true, true)
    LocationManager.instance.add(l)
    const dimensions = new Point(7, 5)
    const interactablePos = new Point(dimensions.x/2, dimensions.y).times(TILE_SIZE)
    const teleporter: Teleporter = { to: outside.uuid, pos: interactablePos.plusY(-4) }

    l.setBarriers(InteriorUtils.makeBarriers(dimensions))
    l.addTeleporter(teleporter)
    l.addElement(ElementType.TELEPORTER, new Point(3, 5), { to: outside.uuid, i: interactablePos.toString() })

    const woodType = Math.ceil(Math.random() * 2)
    for (let x = 0; x < dimensions.x; x++) {
        for (let y = 0; y < dimensions.y; y++) {
            l.addGroundElement(GroundType.BASIC, new Point(x, y), { k: `hardwood${woodType}` })
        }
        let topAndBottomTiles = ["wallCenter", "wallCenter"]
        if (x === 0) {
            topAndBottomTiles = ["wallLeft", "wallRight"]
        } else if (x === dimensions.x-1) {
            topAndBottomTiles = ["wallRight", "wallLeft"]
        }
        l.addGroundElement(GroundType.BASIC, new Point(x, -1), { k: topAndBottomTiles[0] })
        l.addGroundElement(GroundType.BASIC_ROTATED_180, new Point(x, -2), { k: topAndBottomTiles[1] })
    }

    return l
}