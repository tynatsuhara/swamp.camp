import { Point } from "../../../engine/Point"
import { TILE_SIZE } from "../../graphics/Tilesets"
import { ElementType } from "../elements/Elements"
import { GroundType } from "../ground/Ground"
import { LocationManager } from "../LocationManager"
import { Teleporter, TeleporterPrefix } from "../Teleporter"
import { WorldLocation } from "../WorldLocation"
import { InteriorUtils } from "./InteriorUtils"

export const makeHouseInterior = (outside: WorldLocation): WorldLocation => {
    const l = new WorldLocation(true, true)
    LocationManager.instance.add(l)
    const dimensions = new Point(7, 5)
    const interactablePos = new Point(dimensions.x/2, dimensions.y).times(TILE_SIZE)
    const teleporter: Teleporter = { 
        to: outside.uuid, 
        pos: interactablePos.plusY(-4), 
        id: TeleporterPrefix.DOOR }

    l.setBarriers(InteriorUtils.makeBarriers(dimensions))
    l.addTeleporter(teleporter)
    l.addElement(
        ElementType.TELEPORTER, 
        new Point(3, 5), 
        { 
            to: outside.uuid, 
            i: interactablePos.toString(),
            id: TeleporterPrefix.DOOR
        }
    )

    const woodType = Math.ceil(Math.random() * 2)

    const addWallSprite = (key: string, pt: Point, rotation: number) => {
        l.sprites.addSprite(key, pt.times(TILE_SIZE), rotation, -100000)
    }

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
        addWallSprite(topAndBottomTiles[0], new Point(x, -1), 0)
        addWallSprite(topAndBottomTiles[1], new Point(x, -2), 180)
    }

    return l
}