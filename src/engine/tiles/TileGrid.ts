import { Grid } from "../util/Grid"
import { TileSource } from "./TileSource"
import { Entity } from "../Entity"
import { TileComponent } from "./TileComponent"
import { Point } from "../point"

/**
 * A tile grid that uses tile dimensions instead of pixel dimensions
 * (A tile is 1x1 instead of TILE_SIZExTILE_SIZE, then scaled to render)
 * 
 * TODO is this class serving a purpose?
 */
export class TileGrid extends Grid<Entity> {
    readonly tileSize: number

    constructor(tileSize: number) {
        super()
        this.tileSize = tileSize
    }

    createTileEntity(source: TileSource, pos: Point): Entity {
        const entity = new Entity([source.at(pos)])
        this.set(pos, entity)
        return entity
    }
}