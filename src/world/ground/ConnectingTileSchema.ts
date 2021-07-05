import { Point } from "brigsby/dist/Point"
import { ImageRender } from "brigsby/dist/renderer/ImageRender"
import { Grid } from "brigsby/dist/util/Grid"
import { WorldLocation } from "../WorldLocation"
import { ConnectingTile } from "./ConnectingTile"
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
    abstract render(location: WorldLocation, position: Point): ImageRender[] 

    protected get(grid: Grid<GroundComponent>, pt: Point): ConnectingTile {
        const el = grid.get(pt)
        if (el) {
            const ct = el.entity.getComponent(ConnectingTile)
            if (ct && this.canConnect(ct.schema)) {
                return ct
            }
        }
    }
}
