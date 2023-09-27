import { Entity, Point } from "brigsby/dist"
import { SpriteComponent, SpriteTransform } from "brigsby/dist/sprites"
import { DudeType } from "../../characters/DudeType"
import { TILE_SIZE, Tilesets } from "../../graphics/Tilesets"
import { ElementComponent } from "../elements/ElementComponent"
import { ElementType } from "../elements/ElementType"
import { Interactable } from "../elements/Interactable"
import { NavMeshCollider } from "../elements/NavMeshCollider"
import { GroundType } from "../ground/Ground"
import { BasicLocation } from "../locations/BasicLocation"
import { Location } from "../locations/Location"
import { LocationManager } from "../locations/LocationManager"
import { LocationType } from "../locations/LocationType"
import { SingleTypeResidence } from "../residences/SingleTypeResidence"
import { BuildingFactory } from "./Building"
import { interactableDoorIconSupplier } from "./BuildingUtils"
import { InteriorUtils } from "./InteriorUtils"

type HouseData = {
    destinationUUID: string
    residents: string[]
}

export class HouseFactory extends BuildingFactory<ElementType.HOUSE> {
    readonly dimensions = new Point(5, 4)

    constructor() {
        super(ElementType.HOUSE)
    }

    makeBuilding(wl: Location, pos: Point, data: HouseData) {
        const e = new Entity()

        // the interior location UUID
        const destinationUUID: string = data.destinationUUID ?? makeHouseInterior(wl).uuid
        const residents = data.residents || []

        const interactablePos = pos.plus(new Point(2.5, 3)).times(TILE_SIZE)
        LocationManager.instance.setTeleporter(
            destinationUUID,
            "a",
            {
                location: wl.uuid,
                pos: interactablePos.plusY(12),
            },
            "door"
        )

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
                () => LocationManager.instance.playerUseTeleporter(destinationUUID),
                new Point(0, -TILE_SIZE * 1.4),
                undefined,
                interactableDoorIconSupplier(destinationUUID)
            )
        )

        const residence = e.addComponent(
            new SingleTypeResidence(DudeType.VILLAGER, 1, destinationUUID, residents)
        )

        const save: () => HouseData = () => ({
            destinationUUID,
            residents: residence.getResidentUUIDs(),
        })

        return e.addComponent(new ElementComponent(this.type, pos, save))
    }
}

const makeHouseInterior = (outside: Location): Location => {
    const l = new BasicLocation({
        type: LocationType.HOUSE_INTERIOR,
        isInterior: true,
        allowPlacing: false,
    })

    const dimensions = new Point(7, 5)
    const interactablePos = new Point(dimensions.x / 2, dimensions.y).times(TILE_SIZE)

    InteriorUtils.addBarriers(l, dimensions)
    InteriorUtils.addTeleporter(l, interactablePos)

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
