import { Point } from "brigsby/dist"
import { ImageRender } from "brigsby/dist/renderer"
import { SpriteTransform, StaticSpriteSource } from "brigsby/dist/sprites"
import { Tilesets, TILE_SIZE } from "../../graphics/Tilesets"
import { Location } from "../locations/Location"
import { ConnectingTileSchema } from "./ConnectingTileSchema"
import { ConnectingTileWaterfallSchema } from "./ConnectingTileWaterfallSchema"
import { GroundType } from "./Ground"
import { GroundComponent } from "./GroundComponent"
import { GroundRenderer } from "./GroundRenderer"

const CORNER_SIZE = TILE_SIZE / 2
const CORNER_DIMS = new Point(CORNER_SIZE, CORNER_SIZE)

/**
 * Defines how a type of connecting tiles interacts with other types of connecting tiles.
 */
export class ConnectingTileWaterSchema extends ConnectingTileSchema {
    static readonly DEPTH = GroundRenderer.DEPTH + 2

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
        const ne = this.get(location, new Point(x + 1, y - 1))
        const e = this.get(location, new Point(x + 1, y))
        const se = this.get(location, new Point(x + 1, y + 1))
        const s = this.get(location, new Point(x, y + 1))
        const sw = this.get(location, new Point(x - 1, y + 1))
        const w = this.get(location, new Point(x - 1, y))
        const nw = this.get(location, new Point(x - 1, y - 1))

        let results: ImageRender[] = []

        const render = (
            source: StaticSpriteSource,
            mirrorX: boolean = false,
            offset = Point.ZERO
        ) => {
            results.push(
                source.toImageRender(
                    SpriteTransform.new({
                        position: position.times(TILE_SIZE).plus(offset),
                        mirrorX,
                        depth: ConnectingTileWaterSchema.DEPTH,
                    })
                )
            )
        }

        const tilemap = Tilesets.instance.tilemap

        const renderCorner = (x: number, y: number) => {
            const offset = new Point(x, y).times(CORNER_SIZE)
            const corners = tilemap.getTileAt(new Point(5, 1))
            const tile = new StaticSpriteSource(
                corners.image,
                corners.position.plus(offset),
                CORNER_DIMS
            )
            render(tile, false, offset)
        }

        // top
        if (!n) {
            render(tilemap.getTileAt(new Point(5, 0)))
        } else if (n?.entity.getComponent(GroundComponent).type === GroundType.WATERFALL) {
            // TODO splash
        }
        // bottom
        if (!s) {
            render(tilemap.getTileAt(new Point(5, 2)))
        }

        // sides/corners
        if (!w && !n) {
            render(tilemap.getTileAt(new Point(4, 0)))
        } else if (!w) {
            render(tilemap.getTileAt(new Point(4, 1)))
        }
        if (!w && !s) {
            render(tilemap.getTileAt(new Point(4, 2)))
        }

        if (!e && !n) {
            render(tilemap.getTileAt(new Point(4, 0)), true)
        } else if (!e) {
            render(tilemap.getTileAt(new Point(4, 1)), true)
        }
        if (!e && !s) {
            render(tilemap.getTileAt(new Point(4, 2)), true)
        }

        // small corners
        if (n && w && !nw) {
            renderCorner(0, 0)
        }
        if (n && e && !ne) {
            renderCorner(1, 0)
        }
        if (s && w && !sw) {
            renderCorner(0, 1)
        }
        if (s && e && !se) {
            renderCorner(1, 1)
        }

        return results
    }
}
