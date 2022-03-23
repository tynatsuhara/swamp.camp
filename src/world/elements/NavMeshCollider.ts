import { BoxCollider } from "brigsby/dist/collision/BoxCollider"
import { Collider } from "brigsby/dist/collision/Collider"
import { Point } from "brigsby/dist/Point"
import { pixelPtToTilePt } from "../../graphics/Tilesets"
import { Location } from "../Location"
import { ElementUtils } from "./ElementUtils"

export class NavMeshCollider extends BoxCollider {
    private readonly location: Location

    constructor(
        location: Location,
        position: Point,
        dimensions: Point,
        layer?: string,
        ignoredColliders?: Collider[]
    ) {
        super(position, dimensions, layer, ignoredColliders)
        this.location = location
        this.setNavMeshPoints(true)
    }

    moveTo(point: Point) {
        this.setNavMeshPoints(false)
        const result = super.moveTo(point)
        this.setNavMeshPoints(true)
        return result
    }

    forceSetPosition(point: Point) {
        this.setNavMeshPoints(false)
        const result = super.forceSetPosition(point)
        this.setNavMeshPoints(true)
        return result
    }

    delete() {
        this.setNavMeshPoints(false)
        super.delete()
    }

    private setNavMeshPoints(occupied: boolean) {
        const epsilon = 0.01 // prevent overlapping
        const topLeftTile = pixelPtToTilePt(this.position)
        const bottomRightTile = pixelPtToTilePt(
            this.position.plus(new Point(this.dimensions.x - epsilon, this.dimensions.y - epsilon))
        )
        const navMeshPoints = ElementUtils.rectPoints(
            topLeftTile,
            new Point(bottomRightTile.x - topLeftTile.x + 1, bottomRightTile.y - topLeftTile.y + 1)
        )
        navMeshPoints.forEach((pos) => this.location.setOccupied(pos, occupied))
    }
}
