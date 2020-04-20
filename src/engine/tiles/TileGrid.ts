import { Grid } from "../util/Grid"
import { TileSource } from "./TileSource"
import { Entity } from "../Entity"
import { TileComponent } from "./TileComponent"
import { Point } from "../point"
import { ConnectingTileSchema } from "./ConnectingTileSchema"
import { ConnectingTile } from "./ConnectingTile"
import { Tile } from "../../game/tiles"

/**
 * A tile grid that uses tile dimensions instead of pixel dimensions
 * (A tile is 1x1 instead of TILE_SIZExTILE_SIZE, then scaled to render)
 */
export class TileGrid {
    private readonly grid = new Grid<Entity>()
    readonly tileSize: number

    constructor(tileSize: number) {
        this.tileSize = tileSize
    }

    createTileEntity(source: TileSource, pos: Point): Entity {
        const entity = new Entity([new TileComponent(source, pos.times(this.tileSize))])
        this.grid.set(pos, entity)
        return entity
    }

    get(pos: Point): Entity {
        return this.grid.get(pos)
    }

    remove(pos) {
        this.grid.remove(pos)
    }

    entities(): Entity[] {
        return this.grid.entries()
    }

    // TODO this should be part of the game, not the engine
    renderPath(
        start: Point, 
        end: Point, 
        tileSchema: ConnectingTileSchema,
        randomness: number
    ) {
        const heuristic = (pt: Point): number => {
            const v = pt.distanceTo(end) * Math.random() * randomness
            const el = this.grid.get(pt)
            if (!el) {
                return v
            }
            const ct = el.getComponent(ConnectingTile)
            if (!ct || !ct.schema.canConnect(tileSchema)) {
                return v
            }
            return v/12
        }

        const occupiedCannotConnect = (pt: Point) => {
            const el = this.grid.get(pt)
            if (!el) {
                return false  // definitely not occupied
            }
            const ct = el.getComponent(ConnectingTile)
            if (!ct) {
                return true  // can't connect, therefore occupied
            }
            return !tileSchema.canConnect(ct.schema)
        }

        const path = this.grid.findPath(
            start, 
            end, 
            heuristic, 
            occupiedCannotConnect
        )

        if (!path) {
            return
        }

        path.forEach(pt => {
            const entity = new Entity([new ConnectingTile(tileSchema, this, pt)])
            this.grid.set(pt, entity)
        })
    }
}