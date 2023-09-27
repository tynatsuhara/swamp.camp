import { Entity, Point, pt } from "brigsby/dist"
import { SpriteComponent, SpriteTransform } from "brigsby/dist/sprites"
import { TILE_SIZE, Tilesets } from "../../graphics/Tilesets"
import { ElementComponent } from "../elements/ElementComponent"
import { ElementType } from "../elements/ElementType"
import { Interactable } from "../elements/Interactable"
import { NavMeshCollider } from "../elements/NavMeshCollider"
import { GroundType } from "../ground/Ground"
import { BasicLocation } from "../locations/BasicLocation"
import { Location } from "../locations/Location"
import { LocationManager, here } from "../locations/LocationManager"
import { LocationType } from "../locations/LocationType"
import { BuildingFactory, ConstructionRequirements } from "./Building"
import { interactableDoorIconSupplier } from "./BuildingUtils"

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

    // TODO how does growing the mine work?

    const pts = [pt(0, 0), pt(0, 1), pt(1, 0), pt(1, -1)]

    l.addFeature("mineInteriorBackground", { pts })

    // The ladder is always at (0, 0)
    const interactablePos = new Point(0.5, 0).times(TILE_SIZE)
    LocationManager.instance.setTeleporter(
        l.uuid,
        "b",
        { location: l.uuid, pos: interactablePos.plusY(12) },
        "mine"
    )

    l.addElement(ElementType.MINE_EXIT, Point.ZERO, { i: interactablePos.toString() })

    // Indicate the open floor points so NPCs can roam
    pts.forEach((p) => l.setGroundElement(GroundType.BASIC, p))

    return LocationManager.instance.add(l)
}

const resizeMine = (l: Location) => {
    const bg = l.getFeatureOfType("mineInteriorBackground")

    bg.pts

    l.removeFeaturesOfType("mineInteriorBackground")
    l.addFeature("mineInteriorBackground", bg)
}

window["resizeMine"] = () => resizeMine(here())
