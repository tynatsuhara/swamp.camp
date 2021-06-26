import { Point } from "../../../engine/Point"
import { ImageRender } from "../../../engine/renderer/ImageRender"
import { Grid } from "../../../engine/util/Grid"
import { GroundComponent } from "./GroundComponent"


/**
 * Defines how a type of connecting tiles interacts with other types of connecting tiles.
 */
export abstract class ConnectingTileSchema {

    /**
     * Returns true if one schema can connect to another
     */
    abstract canConnect(schema: ConnectingTileSchema): boolean

    /**
     * Renders the tile source based on the given grid and position
     */
    abstract render(grid: Grid<GroundComponent>, position: Point): ImageRender[] 
}
