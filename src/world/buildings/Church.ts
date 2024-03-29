import { Point } from "brigsby/dist"
import { DudeType } from "../../characters/DudeType"
import { TILE_SIZE } from "../../graphics/Tilesets"
import { ElementType } from "../elements/ElementType"
import { GroundType } from "../ground/Ground"
import { BasicLocation } from "../locations/BasicLocation"
import { Location } from "../locations/Location"
import { LocationManager } from "../locations/LocationManager"
import { LocationType } from "../locations/LocationType"
import { AsciiInteriorBuilder } from "./AsciiInteriorBuilder"
import { InteriorUtils } from "./InteriorUtils"
import { SimpleBuildingFactory } from "./SimpleBuildingFactory"

export class ChurchFactory extends SimpleBuildingFactory<ElementType.CHURCH> {
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
    const l = new BasicLocation({
        type: LocationType.CHUCH_INTERIOR,
        isInterior: true,
        allowPlacing: false,
    })

    const dimensions = new Point(7, 9)
    const interactablePos = new Point(dimensions.x / 2, dimensions.y).times(TILE_SIZE)

    InteriorUtils.addBarriers(l, dimensions)

    new AsciiInteriorBuilder(CHURCH_TEMPLATE)
        .map("O", (pos) => l.addElement(ElementType.PODIUM, pos))
        .map("_", (pos) => l.addElement(ElementType.BENCH, pos))
        .map("T", () => InteriorUtils.addTeleporter(l, interactablePos))

    const woodType = Math.ceil(Math.random() * 2)

    const addWallSprite = (key: string, pt: Point, rotation: number) => {
        l.addFeature("sprite", {
            key,
            pixelX: pt.x * TILE_SIZE,
            pixelY: pt.y * TILE_SIZE,
            rotation,
            depth: Number.MIN_SAFE_INTEGER,
        })
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

    return LocationManager.instance.add(l)
}
