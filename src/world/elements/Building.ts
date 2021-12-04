import { Point } from "brigsby/dist/Point"
import { Ground } from "../ground/Ground"
import { Location } from "../Location"
import { ElementFactory } from "./ElementFactory"

/**
 * At runtime, a building exterior is built with several components:
 *   1. Tiles, the visual component
 *   2. A collider
 *   3. A door teleporter
 * Data that is saved:
 *   1. Element type
 *   2. "Occupied points" which determines occupied squares in the world grid
 *   3. Misc metadata about the building
 */
export abstract class BuildingFactory extends ElementFactory {
    canPlaceAtPos(wl: Location, pos: Point) {
        return this.getOccupiedPoints(pos)
            .map((pt) => wl.getGround(pt)?.type)
            .every((type) => Ground.isNaturalGround(type))
    }

    /**
     * returns the points occupied by the building given a global tile position
     */
    abstract getOccupiedPoints(pos: Point): Point[]
}
