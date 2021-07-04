import { StaticSpriteSource } from "../../../engine/sprites/StaticSpriteSource"
import { Point } from "../../../engine/Point"
import { ImageRender } from "../../../engine/renderer/ImageRender"
import { SpriteTransform } from "../../../engine/sprites/SpriteTransform"
import { Tilesets, TILE_SIZE } from "../../graphics/Tilesets"
import { ConnectingTileSchema } from "./ConnectingTileSchema"
import { WorldLocation } from "../WorldLocation"
import { ConnectingTileWaterSchema } from "./ConnectingTileWaterSchema"
import { GroundRenderer } from "../GroundRenderer"

export class ConnectingTileWaterfallSchema extends ConnectingTileSchema {

    static readonly DEPTH = GroundRenderer.DEPTH + 10

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

        const n = this.get(grid, new Point(x, y - 1))
        const e = this.get(grid, new Point(x + 1, y))
        const s = this.get(grid, new Point(x, y + 1))
        const w = this.get(grid, new Point(x - 1, y))
        
        let results: ImageRender[] = []

        const render = (source: StaticSpriteSource, mirrorX: boolean = false) => {
            results.push(source.toImageRender(SpriteTransform.new({ 
                position: position.times(TILE_SIZE), 
                mirrorX, 
                depth: ConnectingTileWaterfallSchema.DEPTH
            })))
        }

        const tilemap = Tilesets.instance.tilemap
        const level = location.levels.get(position)
        const flowingSouth = location.levels.get(position.plusY(1)) < level

        // waterflow flowing south
        if (!w) {
            render(tilemap.getTileAt(
                flowingSouth ? new Point(1, 0) : new Point(3, 2)
            ))
        }
        if (!e) {
            render(tilemap.getTileAt(
                flowingSouth ? new Point(1, 0) : new Point(3, 2),
            ), true)
        }

        // waterfall flowing east/west
        const flowingEast = location.levels.get(position.plusX(1)) < level

        if (!n) {
            render(tilemap.getTileAt(new Point(3, 0)), flowingEast)
        }
        if (!s) {
            render(tilemap.getTileAt(new Point(3, 1)), flowingEast)
        }

        return results
    }
}
