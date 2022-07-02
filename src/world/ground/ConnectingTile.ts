import { Component, Point } from "brigsby/lib"
import { ImageRender } from "brigsby/lib/renderer"
import { GroundRenderer } from "../GroundRenderer"
import { Location } from "../Location"
import { here } from "../LocationManager"
import { ConnectingTileSchema } from "./ConnectingTileSchema"

export class ConnectingTile extends Component {
    readonly schema: ConnectingTileSchema
    private readonly location: Location
    private readonly position: Point

    /**
     * Connecting tiles require a tile grid. The position parameter should be tile-scale, not pixel-scale.
     */
    constructor(
        schema: ConnectingTileSchema,
        location: Location,
        position: Point = new Point(0, 0)
    ) {
        super()
        this.schema = schema
        this.location = location
        this.position = position
    }

    start() {
        GroundRenderer.instance.clearTile(here(), this.position)
    }

    getRenderMethods(): ImageRender[] {
        return this.schema.render(this.location, this.position)
    }
}
