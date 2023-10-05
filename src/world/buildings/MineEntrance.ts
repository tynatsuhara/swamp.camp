import { Entity, Point, pt } from "brigsby/dist"
import { SpriteComponent, SpriteTransform } from "brigsby/dist/sprites"
import { TILE_SIZE, Tilesets } from "../../graphics/Tilesets"
import { ElementComponent } from "../elements/ElementComponent"
import { ElementType } from "../elements/ElementType"
import { Interactable } from "../elements/Interactable"
import { NavMeshCollider } from "../elements/NavMeshCollider"
import { Ground } from "../ground/Ground"
import { Location } from "../locations/Location"
import { LocationManager } from "../locations/LocationManager"
import { BuildingFactory, ConstructionRequirements } from "./Building"
import { interactableDoorIconSupplier } from "./BuildingUtils"
import { MineInterior } from "./MineInterior"

type SaveFormat = { destinationUUID: string }

export class MineEntranceFactory extends BuildingFactory<ElementType.MINE_ENTRANCE, SaveFormat> {
    readonly type = ElementType.MINE_ENTRANCE
    readonly dimensions = pt(3)

    constructor() {
        super(ElementType.MINE_ENTRANCE)
    }

    makeBuilding(wl: Location, pos: Point, data: Partial<SaveFormat>) {
        const e = new Entity()
        const pixelPt = pos.plus(pt(1)).times(TILE_SIZE)

        // the interior location UUID
        const destinationUUID: string = data.destinationUUID ?? MineInterior.make(wl)

        // Render hole
        e.addComponent(
            new SpriteComponent(
                Tilesets.instance.tilemap.getTileAt(new Point(0, 8)),
                SpriteTransform.new({
                    position: pixelPt,
                    depth: pixelPt.y + 3,
                })
            )
        )

        // Set up collider
        const colliderSize = new Point(14, 12)
        e.addComponent(
            new NavMeshCollider(
                wl,
                pixelPt.plus(new Point(TILE_SIZE / 2, TILE_SIZE / 2)).minus(colliderSize.div(2)),
                colliderSize
            )
        )

        // Set up teleporter
        const interactablePos = pixelPt.plus(new Point(TILE_SIZE / 2, TILE_SIZE / 2))
        LocationManager.instance.setTeleporter(
            destinationUUID,
            "a",
            { location: wl.uuid, pos: interactablePos.plusY(16) },
            "mine"
        )
        e.addComponent(
            new Interactable(
                interactablePos,
                () => LocationManager.instance.playerUseTeleporter(destinationUUID),
                new Point(0, -17),
                undefined,
                interactableDoorIconSupplier(destinationUUID)
            )
        )

        return e.addComponent(
            new ElementComponent(ElementType.MINE_ENTRANCE, pos, () => ({
                destinationUUID,
            }))
        )
    }

    getConstructionRequirements(): ConstructionRequirements {
        return {
            hours: 24,
            // no materials required
        }
    }

    canPlaceInLocation(wl: Location) {
        return !wl.isInterior
    }

    canPlaceAtPos(wl: Location, pos: Point) {
        return Ground.isNaturalGround(wl.getGround(pos)?.type)
    }
}
