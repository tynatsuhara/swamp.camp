import { Point } from "brigsby/dist"
import { DudeType } from "../../characters/DudeType"
import { TILE_SIZE } from "../../graphics/Tilesets"
import { ElementType } from "../elements/Elements"
import { GroundType } from "../ground/Ground"
import { Location } from "../locations/Location"
import { LocationManager, LocationType } from "../locations/LocationManager"
import { Teleporter, TeleporterPrefix } from "../Teleporter"
import { AsciiInteriorBuilder } from "./AsciiInteriorBuilder"
import { InteriorUtils } from "./InteriorUtils"
import { SimpleBuildingFactory } from "./SimpleBuildingFactory"

export class ChurchFactory extends SimpleBuildingFactory {
    constructor() {
        super(
            ElementType.CHURCH,
            new Point(5, 4),
            "church",
            makeChurchInterior,
            new Point(TILE_SIZE * 3, TILE_SIZE * 2),
            { [DudeType.NUN]: 3, [DudeType.CLERIC]: 2, [DudeType.BISHOP]: 1 }
        )
    }
}

const CHURCH_TEMPLATE = `
.......
...O...
.......
.__.__.
.......
.__.__.
.......
.__.__.
.......
   T   
`

const makeChurchInterior = (outside: Location): Location => {
    const l = new Location(LocationType.CHUCH_INTERIOR, true, false)

    LocationManager.instance.add(l)
    const dimensions = new Point(7, 9)
    const interactablePos = new Point(dimensions.x / 2, dimensions.y).times(TILE_SIZE)
    const teleporter: Teleporter = {
        to: outside.uuid,
        pos: interactablePos.plusY(-4),
        id: TeleporterPrefix.DOOR,
    }

    InteriorUtils.addBarriers(l, dimensions)
    l.addTeleporter(teleporter)

    new AsciiInteriorBuilder(CHURCH_TEMPLATE)
        .map("O", (pos) => l.addElement(ElementType.PODIUM, pos))
        .map("_", (pos) => l.addElement(ElementType.BENCH, pos))
        .map("T", (pos) =>
            l.addElement(ElementType.TELEPORTER_INDICATOR, pos, {
                to: outside.uuid,
                i: interactablePos.toString(),
                id: TeleporterPrefix.DOOR,
            })
        )

    const woodType = Math.ceil(Math.random() * 2)

    const addWallSprite = (key: string, pt: Point, rotation: number) => {
        l.sprites.addSprite(key, pt.times(TILE_SIZE), rotation, -100000)
    }

    // walls
    for (let x = 0; x < dimensions.x; x++) {
        for (let y = 0; y < dimensions.y; y++) {
            l.setGroundElement(GroundType.BASIC, new Point(x, y), {
                k: `hardwood${woodType}`,
            })
        }
        let topAndBottomTiles = ["wallCenter", "wallCenter"]
        if (x === 0) {
            topAndBottomTiles = ["wallLeft", "wallRight"]
        } else if (x === dimensions.x - 1) {
            topAndBottomTiles = ["wallRight", "wallLeft"]
        }
        addWallSprite(topAndBottomTiles[0], new Point(x, -1), 0)
        addWallSprite(topAndBottomTiles[1], new Point(x, -2), 180)
    }

    return l
}
