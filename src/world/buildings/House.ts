import { BoxCollider } from "brigsby/dist/collision/BoxCollider"
import { Entity } from "brigsby/dist/Entity"
import { Point } from "brigsby/dist/Point"
import { SpriteComponent } from "brigsby/dist/sprites/SpriteComponent"
import { SpriteTransform } from "brigsby/dist/sprites/SpriteTransform"
import { DudeType } from "../../characters/DudeFactory"
import { Tilesets, TILE_SIZE } from "../../graphics/Tilesets"
import { ElementComponent } from "../elements/ElementComponent"
import { ElementType } from "../elements/Elements"
import { ElementUtils } from "../elements/ElementUtils"
import { Interactable } from "../elements/Interactable"
import { GroundType } from "../ground/Ground"
import { Location } from "../Location"
import { LocationManager, LocationType } from "../LocationManager"
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
            new BoxCollider(
                basePos.plus(new Point(0, 1)).times(TILE_SIZE),
                new Point(TILE_SIZE * 3, TILE_SIZE * 2)
            )
        )

        // Set up teleporter
        e.addComponent(
            new Interactable(
                interactablePos,
                () => wl.useTeleporter(destinationUUID, doorId),
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

        return e.addComponent(
            new ElementComponent(this.type, pos, this.getOccupiedPoints(pos), save)
        )
    }

    getOccupiedPoints(pos: Point) {
        return ElementUtils.rectPoints(pos.plus(new Point(1, 1)), new Point(3, 2))
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

    l.setBarriers(InteriorUtils.makeBarriers(dimensions))
    l.addTeleporter(teleporter)
    l.addElement(ElementType.TELEPORTER, new Point(3, 5), {
        to: outside.uuid,
        i: interactablePos.toString(),
        id: TeleporterPrefix.DOOR,
    })

    const woodType = Math.ceil(Math.random() * 2)

    const addWallSprite = (key: string, pt: Point, rotation: number) => {
        l.sprites.addSprite(key, pt.times(TILE_SIZE), rotation, -100000)
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
