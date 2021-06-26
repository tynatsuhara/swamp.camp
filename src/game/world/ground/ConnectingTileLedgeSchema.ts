import { StaticTileSource } from "../../../engine/tiles/StaticTileSource"
import { Point } from "../../../engine/Point"
import { ImageRender } from "../../../engine/renderer/ImageRender"
import { TileTransform } from "../../../engine/tiles/TileTransform"
import { Tilesets, TILE_SIZE } from "../../graphics/Tilesets"
import { ConnectingTileSchema } from "./ConnectingTileSchema"
import { WorldLocation } from "../WorldLocation"

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
        
        const render = (source: StaticTileSource, mirrorX = false) => {
            return source.toImageRender(TileTransform.new({ 
                position: position.times(TILE_SIZE), 
                depth: Number.MIN_SAFE_INTEGER + 1,
                mirrorX
            }))
        }

        /**
         * Preconditions: 
         *   - Every ledge should have at least 2 adjacent ledges (not across from each other) 
         *   - No ledge should have 4 N/E/S/W connections
         */ 

        let result: ImageRender

        if (w === level && e === level && n < level) {
            // this is a top ledge
            result = render(Tilesets.instance.tilemap.getTileAt(new Point(2, 0)))
        } else if (w === level && e === level && s < level) {
            // this is a bottom ledge
            result = render(Tilesets.instance.tilemap.getTileAt(new Point(5, 7)))
        } else if (n === level && s === level && e < level) {
            // this is a right ledge
            result = render(Tilesets.instance.tilemap.getTileAt(new Point(5, 9)), true)
        } else if (n === level && s === level && w < level) {
            // this is a left ledge
            result = render(Tilesets.instance.tilemap.getTileAt(new Point(5, 9)))
        } else if (s < level && w < level) {
            // bottom left corner
            result = render(Tilesets.instance.tilemap.getTileAt(new Point(5, 8)))
        } else if (s < level && e < level) {
            // bottom right corner
            result = render(Tilesets.instance.tilemap.getTileAt(new Point(5, 8)), true)
        } else if (n < level && w < level) {
            // top left corner
            result = render(Tilesets.instance.tilemap.getTileAt(new Point(5, 10)))
        } else if (n < level && e < level) {
            // top right corner
            result = render(Tilesets.instance.tilemap.getTileAt(new Point(5, 10)), true)
        } else if (se < level) {
            // top left inside corner 
            result = render(Tilesets.instance.tilemap.getTileAt(new Point(7, 7)), true)
        } else if (sw < level) {
            // top right inside corner 
            result = render(Tilesets.instance.tilemap.getTileAt(new Point(7, 7)))
        } else if (ne < level) {
            // bottom left inside corner 
            result = render(Tilesets.instance.tilemap.getTileAt(new Point(4, 8)))
        } else if (nw < level) {
            // bottom right inside corner 
            result = render(Tilesets.instance.tilemap.getTileAt(new Point(4, 8)), true)
        }

        if (!result) {
            return []
        }

        return [result]
    }
}
