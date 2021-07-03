import { StaticTileSource } from "../../../engine/tiles/StaticTileSource"
import { Point } from "../../../engine/Point"
import { ImageRender } from "../../../engine/renderer/ImageRender"
import { TileTransform } from "../../../engine/tiles/TileTransform"
import { Tilesets, TILE_SIZE } from "../../graphics/Tilesets"
import { ConnectingTileSchema } from "./ConnectingTileSchema"
import { WorldLocation } from "../WorldLocation"
import { ConnectingTileWaterSchema } from "./ConnectingTileWaterSchema"
import { GroundRenderer } from "../GroundRenderer"

export class ConnectingTileWaterfallSchema extends ConnectingTileSchema {

    static readonly DEPTH = GroundRenderer.DEPTH + 1

    canConnect(schema: ConnectingTileSchema) {
        return schema instanceof ConnectingTileWaterSchema
            || schema instanceof ConnectingTileWaterfallSchema
    }
   
    /**
     * Renders the tile source based on the given grid and position
     */
    render(location: WorldLocation, position: Point): ImageRender[] {
        const grid = location.ground
        const x = position.x
        const y = position.y

        const e = this.get(grid, new Point(x + 1, y))
        const w = this.get(grid, new Point(x - 1, y))
        
        let results: ImageRender[] = []

        const render = (source: StaticTileSource, mirrorX: boolean = false) => {
            results.push(source.toImageRender(TileTransform.new({ 
                position: position.times(TILE_SIZE), 
                mirrorX, 
                depth: ConnectingTileWaterfallSchema.DEPTH
            })))
        }

        const tilemap = Tilesets.instance.tilemap

        // top
        if (!w) {
            render(tilemap.getTileAt(new Point(1, 0)))
        }
        if (!e) {
            render(tilemap.getTileAt(new Point(1, 0)), true)
        }

        return results
    }
}
