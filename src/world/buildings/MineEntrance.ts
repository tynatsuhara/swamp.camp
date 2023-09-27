import { Entity, Point, pt } from "brigsby/dist"
import { SpriteComponent, SpriteTransform } from "brigsby/dist/sprites"
import { Grid, Lists } from "brigsby/dist/util"
import { TILE_SIZE, Tilesets } from "../../graphics/Tilesets"
import { adjacent } from "../../utils/misc"
import { ElementComponent } from "../elements/ElementComponent"
import { ElementType } from "../elements/ElementType"
import { ElementUtils } from "../elements/ElementUtils"
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

    const pts = [pt(0, 0)]

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

    constructMineInterior(l, 0)

    return LocationManager.instance.add(l)
}

const constructMineInterior = (l: Location, growAmount: number) => {
    const { pts } = l.getFeatureOfType("mineInteriorBackground")
    l.removeFeaturesOfType("mineInteriorBackground")

    for (let i = 0; i < growAmount; i++) {
        const excludedPts = ElementUtils.rectPoints(pt(-1, -2), pt(3, 2))
        const gridExclude = new Grid<boolean>()
        excludedPts.forEach((p) => gridExclude.set(p, true))

        const gridPoints = new Grid<boolean>()
        pts.forEach((p) => gridPoints.set(p, true))

        const expandPointsGrid = new Grid<boolean>()
        pts.flatMap((p) => adjacent(p))
            .filter((p) => !gridExclude.get(p) && !gridPoints.get(p))
            .forEach((p) => expandPointsGrid.set(p, true))
        const expandPoints = expandPointsGrid.keys().map((p) => {
            // we're not actually using this right now
            const adjacentExpandedSpots = adjacent(p).filter((p2) => gridPoints.get(p2)).length
            return { p, adjacentExpandedSpots }
        })

        // a single empty spot with points above and below it isnt very nice
        const topPriority = expandPoints.filter(
            ({ p }) => gridPoints.get(p.plusY(1)) && gridPoints.get(p.plusY(-1))
        )

        const { p } = Lists.oneOf(topPriority.length > 0 ? topPriority : expandPoints)
        pts.push(p)

        // TODO make this work (canPlaceAtPos etc)
        if (Math.random() < 0.1) {
            l.addElement(ElementType.ROCK, p)
        }
    }

    pts.forEach((p) => l.setGroundElement(GroundType.BASIC, pt(p.x, p.y)))

    l.addFeature("mineInteriorBackground", { pts })
}

window["resizeMine"] = () => constructMineInterior(here(), 10)
