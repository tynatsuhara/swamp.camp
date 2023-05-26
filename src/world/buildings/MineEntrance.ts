import { Entity, Point } from "brigsby/dist"
import { SpriteComponent, SpriteTransform } from "brigsby/dist/sprites"
import { TILE_SIZE, Tilesets } from "../../graphics/Tilesets"
import { Teleporter, TeleporterPrefix } from "../Teleporter"
import { ElementComponent } from "../elements/ElementComponent"
import { ElementType } from "../elements/ElementType"
import { ElementUtils } from "../elements/ElementUtils"
import { Interactable } from "../elements/Interactable"
import { NavMeshCollider } from "../elements/NavMeshCollider"
import { GroundType } from "../ground/Ground"
import { BasicLocation } from "../locations/BasicLocation"
import { Location } from "../locations/Location"
import { LocationManager } from "../locations/LocationManager"
import { LocationType } from "../locations/LocationType"
import { BuildingFactory, ConstructionRequirements } from "./Building"
import { InteriorUtils } from "./InteriorUtils"

type SaveFormat = { destinationUUID: string }

export class MineEntranceFactory extends BuildingFactory<ElementType.MINE_ENTRANCE, SaveFormat> {
    readonly type = ElementType.MINE_ENTRANCE
    readonly dimensions = new Point(1, 1)

    constructor() {
        super(ElementType.MINE_ENTRANCE)
    }

    makeBuilding(wl: Location, pos: Point, data: Partial<SaveFormat>) {
        const e = new Entity()
        const pixelPt = pos.times(TILE_SIZE)

        // the interior location UUID
        const destinationUUID: string = data.destinationUUID ?? makeMineInterior(wl).uuid

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
        const doorId = TeleporterPrefix.MINE
        wl.addTeleporter({
            to: destinationUUID,
            pos: interactablePos.plusY(16),
            id: doorId,
        })
        e.addComponent(
            new Interactable(
                interactablePos,
                () => wl.playerUseTeleporter(destinationUUID, doorId),
                new Point(0, -17)
            )
        )

        return e.addComponent(
            new ElementComponent(ElementType.MINE_ENTRANCE, pos, () => ({
                destinationUUID,
            }))
        )
    }

    getConstructionRequirements(): ConstructionRequirements {
        return undefined
    }

    canPlaceInLocation(wl: Location) {
        return !wl.isInterior
    }

    canPlaceAtPos(wl: Location, pos: Point) {
        return wl.getGround(pos)?.type === GroundType.PATH
    }
}

const makeMineInterior = (outside: Location) => {
    const l = new BasicLocation({
        type: LocationType.MINE_INTERIOR,
        isInterior: true,
        allowPlacing: false,
    })

    const dimensions = new Point(3, 2)
    InteriorUtils.addBarriers(l, dimensions)

    const ladderIndex = 1

    l.addFeature("mineInteriorBackground", {
        width: dimensions.x,
        height: dimensions.y,
        ladderIndex,
    })

    const interactablePos = new Point(ladderIndex + 0.5, 0).times(TILE_SIZE)
    const teleporter: Teleporter = {
        to: outside.uuid,
        pos: interactablePos.plusY(12),
        id: TeleporterPrefix.MINE,
    }
    l.addTeleporter(teleporter)

    l.addElement(ElementType.MINE_EXIT, new Point(Math.ceil(dimensions.x / 2), 0), {
        to: outside.uuid,
        i: interactablePos.toString(),
        id: TeleporterPrefix.MINE,
    })

    // Indicate the open floor points so NPCs can roam
    ElementUtils.rectPoints(Point.ZERO, dimensions).forEach((pt) =>
        l.setGroundElement(GroundType.BASIC, pt)
    )

    return LocationManager.instance.add(l)
}
