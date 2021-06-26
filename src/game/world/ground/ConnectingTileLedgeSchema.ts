import { StaticTileSource } from "../../../engine/tiles/StaticTileSource"
import { Point } from "../../../engine/Point"
import { ImageRender } from "../../../engine/renderer/ImageRender"
import { TileTransform } from "../../../engine/tiles/TileTransform"
import { ConnectingTile } from "./ConnectingTile"
import { Grid } from "../../../engine/util/Grid"
import { GroundComponent } from "./GroundComponent"
import { Tilesets, TILE_SIZE } from "../../graphics/Tilesets"
import { ConnectingTileSchema } from "./ConnectingTileSchema"
import { GroundType } from "./Ground"
import { WorldLocation } from "../WorldLocation"

const CORNER_SIZE = TILE_SIZE/2
const CORNER_DIMS = new Point(CORNER_SIZE, CORNER_SIZE)

/**
 * Defines how a type of connecting tiles interacts with other types of connecting tiles.
 */
export class ConnectingTileLedgeSchema extends ConnectingTileSchema {

    canConnect(schema: ConnectingTileSchema) {
        return schema instanceof ConnectingTileLedgeSchema
    }
   
    /**
     * Renders the tile source based on the given grid and position
     */
    render(location: WorldLocation, position: Point): ImageRender[] {
        const level = location.levels.get(position)
        const x = position.x
        const y = position.y

        const n = location.levels.get(new Point(x, y - 1))
        const ne = location.levels.get(new Point(x + 1, y - 1))
        const e = location.levels.get(new Point(x + 1, y))
        const se = location.levels.get(new Point(x + 1, y + 1))
        const s = location.levels.get(new Point(x, y + 1))
        const sw = location.levels.get(new Point(x - 1, y + 1))
        const w = location.levels.get(new Point(x - 1, y))
        const nw = location.levels.get(new Point(x - 1, y - 1))
        
        const render = (source: StaticTileSource, rotation: number = 0, offset = Point.ZERO) => {
            return source.toImageRender(TileTransform.new({ 
                position: position.times(TILE_SIZE).plus(offset), 
                rotation, 
                depth: Number.MIN_SAFE_INTEGER + 1
            }))
        }

        /**
         * Preconditions: 
         *   - Every ledge should have at least 2 adjacent ledges (not across from each other) 
         *   - No ledge should have 4 N/E/S/W connections
         */ 

        let tile: StaticTileSource

        if (w === level && e === level) {
            if (n < level) {
                // this is a top ledge
                tile = Tilesets.instance.tilemap.getTileAt(new Point(2, 0))
            } else if (s < level) {
                // this is a bottom ledge
                tile = Tilesets.instance.tilemap.getTileAt(new Point(2, 2))
            }
        } else if (n === level && s === level) {
            if (e < level) {
                // this is a right ledge
                tile = Tilesets.instance.tilemap.getTileAt(new Point(3, 1))
            } else if (w < level) {
                // this is a left ledge
                tile = Tilesets.instance.tilemap.getTileAt(new Point(1, 1))
            }
        } else if (n === level && e === level) {
            // bottom left corner
            tile = Tilesets.instance.tilemap.getTileAt(new Point(1, 2))
        } else if (n === level && w === level) {
            // bottom right corner
            tile = Tilesets.instance.tilemap.getTileAt(new Point(3, 2))
        } else if (s === level && e === level) {
            // top left corner
            tile = Tilesets.instance.tilemap.getTileAt(new Point(1, 0))
        } else if (s === level && w === level) {
            // top right corner
            tile = Tilesets.instance.tilemap.getTileAt(new Point(3, 0))
        }

        if (!tile) {
            return []
        }

        return [render(tile)]
    }
}
