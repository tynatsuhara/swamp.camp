import { Point } from "../engine/point"
import { ConnectingTileSchema } from "../engine/tiles/ConnectingTileSchema"
import { ConnectingTile } from "../engine/tiles/ConnectingTile"
import { TileGrid } from "../engine/tiles/TileGrid"
import { Entity } from "../engine/Entity"
import { BoxCollider } from "../engine/collision/BoxCollider"
import { TILE_SIZE } from "./graphics/TileManager"

export class MapGenerator {

    renderPath(
        grid: TileGrid,
        start: Point, 
        end: Point, 
        tileSchema: ConnectingTileSchema,
        randomness: number
    ) {
        const heuristic = (pt: Point): number => {
            const v = pt.distanceTo(end) * Math.random() * randomness
            const el = grid.get(pt)
            if (!el) {
                return v
            }
            const ct = el.getComponent(ConnectingTile)
            if (!ct || !ct.schema.canConnect(tileSchema)) {
                return v
            }
            const reuseCostMultiplier = 1/10
            return v * reuseCostMultiplier
        }

        const occupiedCannotConnect = (pt: Point) => {
            const el = grid.get(pt)
            if (!el) {
                return false  // definitely not occupied
            }
            const ct = el.getComponent(ConnectingTile)
            if (!ct) {
                return true  // can't connect, therefore occupied
            }
            return !tileSchema.canConnect(ct.schema)
        }

        const path = grid.findPath(
            start, 
            end, 
            heuristic, 
            occupiedCannotConnect
        )

        if (!path) {
            return
        }

        path.forEach(pt => {
            const entity = new Entity([
                new ConnectingTile(tileSchema, grid, pt),
                new BoxCollider(pt.times(TILE_SIZE), new Point(TILE_SIZE, TILE_SIZE), true)
            ])
            grid.set(pt, entity)
        })
    }
}