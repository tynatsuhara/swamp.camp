import { Point } from "../point"
import { TileGrid } from "./TileGrid"
import { ImageRender } from "../renderer/ImageRender"
import { Component } from "../component"
import { ConnectingTileSchema } from "./ConnectingTileSchema"

// TODO unify tile components with a single base class?
export class ConnectingTile extends Component {
    readonly schema: ConnectingTileSchema
    private readonly grid: TileGrid
    private readonly position: Point

    /**
     * Connecting tiles require a tile grid. The position parameter should be tile-scale, not pixel-scale.
     */
    constructor(schema: ConnectingTileSchema, grid: TileGrid, position: Point = new Point(0, 0)) {
        super()
        this.schema = schema
        this.grid = grid
        this.position = position
    }

    getRenderMethods(): ImageRender[] {
        return [this.schema.render(this.grid, this.position)]
    }
}