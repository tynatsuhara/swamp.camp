import { Point, pt } from "brigsby/dist"
import { Grid, Lists } from "brigsby/dist/util"
import { TILE_SIZE } from "../../graphics/Tilesets"
import { adjacent } from "../../utils/misc"
import { ElementType } from "../elements/ElementType"
import { ElementUtils } from "../elements/ElementUtils"
import { GroundType } from "../ground/Ground"
import { BasicLocation } from "../locations/BasicLocation"
import { Location } from "../locations/Location"
import { LocationManager } from "../locations/LocationManager"
import { LocationType } from "../locations/LocationType"

/**
 * @returns the new interior location uuid
 */
const make = (outside: Location): string => {
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

    expand(l, 0)

    return LocationManager.instance.add(l).uuid
}

const expand = (l: Location, growAmount: number) => {
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
        if (Math.random() < 0.06) {
            l.addElement(ElementType.ROCK, p, { m: false /* no moss */ })
        }
    }

    pts.forEach((p) => l.setGroundElement(GroundType.BASIC, pt(p.x, p.y)))

    l.addFeature("mineInteriorBackground", { pts })
}

export const MineInterior = { make, expand }
