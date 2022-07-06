import { Entity, Point } from "brigsby/dist"
import { NineSlice, SpriteComponent, SpriteTransform } from "brigsby/dist/sprites"
import { Tilesets, TILE_SIZE } from "../../graphics/Tilesets"
import { ElementComponent } from "../elements/ElementComponent"
import { ElementType } from "../elements/Elements"
import { Interactable } from "../elements/Interactable"
import { NavMeshCollider } from "../elements/NavMeshCollider"
import { GroundType } from "../ground/Ground"
import { Location } from "../Location"
import { LocationManager, LocationType } from "../LocationManager"
import { Teleporter, TeleporterPrefix } from "../Teleporter"
import { AsciiInteriorBuilder } from "./AsciiInteriorBuilder"
import { BuildingFactory } from "./Building"
import { InteriorUtils } from "./InteriorUtils"

export const enum TentColor {
    RED = "red",
    BLUE = "blue",
}

export class TentFactory extends BuildingFactory {
    readonly type = ElementType.TENT
    readonly dimensions = new Point(4, 3)

    make(wl: Location, pos: Point, data: any): ElementComponent {
        const e = new Entity()

        const color: TentColor = data.color ?? TentColor.BLUE
        const destinationUUID: string = data.destinationUUID ?? makeTentInterior(wl, color).uuid

        const interactablePos = pos.plus(new Point(2, 2)).times(TILE_SIZE)
        const doorId = TeleporterPrefix.TENT
        const sourceTeleporter = {
            to: destinationUUID,
            pos: interactablePos.plusY(12),
            id: doorId,
        }
        wl.addTeleporter(sourceTeleporter)

        // Set up tiles
        const depth = (pos.y + 1) * TILE_SIZE + /* prevent clipping */ 1
        addTile(e, `${color}tentNW`, pos.plusX(1), depth)
        addTile(e, `${color}tentNE`, pos.plus(new Point(2, 0)), depth)
        addTile(e, `${color}tentSW`, pos.plus(new Point(1, 1)), depth)
        addTile(e, `${color}tentSE`, pos.plus(new Point(2, 1)), depth)
        e.addComponent(
            new NavMeshCollider(
                wl,
                pos.plus(new Point(1, 1)).times(TILE_SIZE),
                new Point(TILE_SIZE * 2, TILE_SIZE)
            )
        )

        // Set up teleporter
        e.addComponent(
            new Interactable(
                interactablePos,
                () => wl.playerUseTeleporter(destinationUUID, doorId),
                new Point(1, -TILE_SIZE * 1.4)
            )
        )

        return e.addComponent(
            new ElementComponent(ElementType.TENT, pos, () => {
                return { destinationUUID, color }
            })
        )
    }
}

const addTile = (e: Entity, s: string, pos: Point, depth: number) => {
    const tile = e.addComponent(
        new SpriteComponent(
            Tilesets.instance.outdoorTiles.getTileSource(s),
            new SpriteTransform(pos.times(TILE_SIZE))
        )
    )
    tile.transform.depth = depth
}

const TENT_TEMPLATE = `
  ^  
 /xl
/xxxl
`

const makeTentInterior = (outside: Location, color: TentColor): Location => {
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
    l.addElement(ElementType.TELEPORTER_INDICATOR, new Point(2, 4), {
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

    new AsciiInteriorBuilder(TENT_TEMPLATE)
        .map("/", (pt) => addWallSprite(`${color}tentl`, pt))
        .map("^", (pt) => addWallSprite(`${color}tenttip`, pt))
        .map("l", (pt) => addWallSprite(`${color}tentr`, pt))
        .map("x", (pt) => addWallSprite(`${color}tentCenter`, pt))

    return l
}
