import { Point } from "brigsby/lib"
import { ImageRender } from "brigsby/lib/renderer"
import { Location } from "../Location"
import { ConnectingTile } from "./ConnectingTile"

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
    abstract render(location: Location, position: Point): ImageRender[]

    protected get(location: Location, pt: Point): ConnectingTile {
        const ground = location.getGround(pt)
        if (ground) {
            const ct = ground.entity.getComponent(ConnectingTile)
            if (ct && this.canConnect(ct.schema)) {
                return ct
            }
        }
    }
}
