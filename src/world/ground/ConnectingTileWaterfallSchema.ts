import { Point } from "brigsby/dist"
import { ImageRender } from "brigsby/dist/renderer"
import { SpriteTransform, StaticSpriteSource } from "brigsby/dist/sprites"
import { Tilesets, TILE_SIZE } from "../../graphics/Tilesets"
import { GroundRenderer } from "../GroundRenderer"
import { Location } from "../locations/Location"
import { ConnectingTileSchema } from "./ConnectingTileSchema"
import { ConnectingTileWaterSchema } from "./ConnectingTileWaterSchema"

export class ConnectingTileWaterfallSchema extends ConnectingTileSchema {
    static readonly DEPTH = GroundRenderer.DEPTH + 10

    canConnect(schema: ConnectingTileSchema) {
        return (
            schema instanceof ConnectingTileWaterSchema ||
            schema instanceof ConnectingTileWaterfallSchema
        )
    }

    /**
     * Renders the tile source based on the given grid and position
     */
    render(location: Location, position: Point): ImageRender[] {
        const x = position.x
        const y = position.y

        const n = this.get(location, new Point(x, y - 1))
        const e = this.get(location, new Point(x + 1, y))
        const s = this.get(location, new Point(x, y + 1))
        const w = this.get(location, new Point(x - 1, y))

        let results: ImageRender[] = []

        const render = (source: StaticSpriteSource, mirrorX: boolean = false) => {
            results.push(
                source.toImageRender(
                    SpriteTransform.new({
                        position: position.times(TILE_SIZE),
                        mirrorX,
                        depth: ConnectingTileWaterfallSchema.DEPTH,
                    })
                )
            )
        }

        const tilemap = Tilesets.instance.tilemap
        const level = location.levels.get(position)
        const flowingSouth = location.levels.get(position.plusY(1)) < level

        // waterflow flowing south
        if (!w) {
            render(tilemap.getTileAt(flowingSouth ? new Point(1, 0) : new Point(3, 2)))
        }
        if (!e) {
            render(tilemap.getTileAt(flowingSouth ? new Point(1, 0) : new Point(3, 2)), true)
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
