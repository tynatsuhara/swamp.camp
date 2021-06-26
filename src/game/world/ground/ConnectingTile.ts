import { Point } from "../../../engine/Point"
import { ImageRender } from "../../../engine/renderer/ImageRender"
import { Component } from "../../../engine/Component"
import { ConnectingTileSchema } from "./ConnectingTileSchema"
import { Grid } from "../../../engine/util/Grid"
import { GroundComponent } from "./GroundComponent"

export class ConnectingTile extends Component {
    readonly schema: ConnectingTileSchema
    private readonly grid: Grid<GroundComponent>
    private readonly position: Point

    /**
     * Connecting tiles require a tile grid. The position parameter should be tile-scale, not pixel-scale.
     */
    constructor(schema: ConnectingTileSchema, grid: Grid<GroundComponent>, position: Point = new Point(0, 0)) {
        super()
        this.schema = schema
        this.grid = grid
        this.position = position
    }

    getRenderMethods(): ImageRender[] {
        return this.schema.render(this.grid, this.position)
    }
}