import { Entity, Point } from "brigsby/dist"
import { SpriteComponent, SpriteTransform } from "brigsby/dist/sprites"
import { DudeType } from "../../characters/DudeType"
import { Tilesets, TILE_SIZE } from "../../graphics/Tilesets"
import { ElementComponent } from "../elements/ElementComponent"
import { ElementType } from "../elements/Elements"
import { Interactable } from "../elements/Interactable"
import { NavMeshCollider } from "../elements/NavMeshCollider"
import { GroundType } from "../ground/Ground"
import { Location } from "../locations/Location"
import { LocationManager, LocationType } from "../locations/LocationManager"
import { SingleTypeResidence } from "../residences/SingleTypeResidence"
import { Teleporter, TeleporterPrefix } from "../Teleporter"
import { BuildingFactory } from "./Building"
import { InteriorUtils } from "./InteriorUtils"

type HouseData = {
    destinationUUID: string
    residents: string[]
}

export class HouseFactory extends BuildingFactory {
    readonly type = ElementType.HOUSE
    readonly dimensions = new Point(5, 4)

    make(wl: Location, pos: Point, data: HouseData): ElementComponent {
        const e = new Entity()

        // the interior location UUID
        const destinationUUID: string = data.destinationUUID ?? makeHouseInterior(wl).uuid
        const residents = data.residents || []

        const interactablePos = pos.plus(new Point(2.5, 3)).times(TILE_SIZE)
        const doorId = TeleporterPrefix.DOOR
        wl.addTeleporter({
            to: destinationUUID,
            pos: interactablePos.plusY(12),
            id: doorId,
        })

        const basePos = pos.plusX(1)

        // Set up tiles
        {
            const depth = (pos.y + 3) * TILE_SIZE

            const addTile = (tileSheetPos: Point, pos: Point) => {
                const tile = Tilesets.instance.tilemap.getTileAt(tileSheetPos)
                const el = e.addComponent(
                    new SpriteComponent(tile, new SpriteTransform(pos.times(TILE_SIZE)))
                )
                el.transform.depth = depth
            }

            // flat roof
            const flatRoofTopLeft = new Point(6, 0)
            addTile(flatRoofTopLeft.plusX(1), basePos)
            addTile(flatRoofTopLeft.plusX(2), basePos.plusX(1))
            addTile(flatRoofTopLeft.plusX(3), basePos.plusX(2))
            addTile(flatRoofTopLeft.plusY(2).plusX(1), basePos.plusY(1))
            addTile(flatRoofTopLeft.plusY(2).plusX(2), basePos.plusY(1).plusX(1))
            addTile(flatRoofTopLeft.plusY(2).plusX(3), basePos.plusY(1).plusX(2))

            // door
            addTile(new Point(7, 6), basePos.plusY(2).plusX(1))

            // no windows
            addTile(new Point(7, 5), basePos.plusY(2))
            addTile(new Point(9, 5), basePos.plusY(2).plusX(2))

            // alternative with windows
            // addTile(new Point(5, 6), basePos.plusY(2))
            // addTile(new Point(6, 6), basePos.plusY(2).plusX(2))
        }

        e.addComponent(
            new NavMeshCollider(
                wl,
                basePos.plus(new Point(0, 1)).times(TILE_SIZE),
                new Point(TILE_SIZE * 3, TILE_SIZE * 2)
            )
        )

        // Set up teleporter
        e.addComponent(
            new Interactable(
                interactablePos,
                () => wl.playerUseTeleporter(destinationUUID, doorId),
                new Point(0, -TILE_SIZE * 1.4)
            )
        )

        const residence = e.addComponent(
            new SingleTypeResidence(DudeType.VILLAGER, 1, destinationUUID, residents)
        )

        const save: () => HouseData = () => ({
            destinationUUID,
            residents: residence.getResidents(),
        })

        return e.addComponent(new ElementComponent(this.type, pos, save))
    }
}

const makeHouseInterior = (outside: Location): Location => {
    const l = new Location(LocationType.HOUSE_INTERIOR, true, false)
    LocationManager.instance.add(l)
    const dimensions = new Point(7, 5)
    const interactablePos = new Point(dimensions.x / 2, dimensions.y).times(TILE_SIZE)
    const teleporter: Teleporter = {
        to: outside.uuid,
        pos: interactablePos.plusY(-4),
        id: TeleporterPrefix.DOOR,
    }

    InteriorUtils.addBarriers(l, dimensions)
    l.addTeleporter(teleporter)
    l.addElement(ElementType.TELEPORTER_INDICATOR, new Point(3, 5), {
        to: outside.uuid,
        i: interactablePos.toString(),
        id: TeleporterPrefix.DOOR,
    })

    const woodType = Math.ceil(Math.random() * 2)

    const addWallSprite = (key: string, pt: Point, rotation: number) => {
        l.addFeature("sprite", {
            key,
            pixelX: pt.x * TILE_SIZE,
            pixelY: pt.y * TILE_SIZE,
            rotation,
            depth: -100000,
        })
    }

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
