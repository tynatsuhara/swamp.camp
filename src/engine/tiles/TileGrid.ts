import { Grid } from "../util/Grid";
import { TileSource } from "./TileSource";
import { Entity } from "../Entity";
import { TileComponent } from "./TileComponent";
import { Point } from "../point";
import { ConnectingTileSchema } from "./ConnectingTileSchema";
import { ConnectingTile } from "./ConnectingTile";
import { Tile } from "../../game/tiles";

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

    entities(): Entity[] {
        return this.grid.entries()
    }

    renderPath(
        start: Point, 
        end: Point, 
        source: TileSource,
        heuristic: (pt: Point) => number = pt => pt.distanceTo(end)
    ) {
        const path = this.grid.findPath(start, end, heuristic)
        if (!path) {
            return
        }
        path.forEach(pt => {
            const entity = new Entity([new ConnectingTile(Tile.PATH, this, pt)])
            this.grid.set(pt, entity)
        })
    }
}