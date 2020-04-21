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
export class TileGrid extends Grid<Entity> {
    readonly tileSize: number

    constructor(tileSize: number) {
        super()
        this.tileSize = tileSize
    }

    createTileEntity(source: TileSource, pos: Point): Entity {
        const entity = new Entity([new TileComponent(source, pos.times(this.tileSize))])
        this.set(pos, entity)
        return entity
    }
}