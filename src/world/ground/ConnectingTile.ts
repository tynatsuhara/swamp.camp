import { Component, Point } from "brigsby/dist"
import { ImageRender } from "brigsby/dist/renderer"
import { Location } from "../locations/Location"
import { here } from "../locations/LocationManager"
import { ConnectingTileSchema } from "./ConnectingTileSchema"
import { GroundRenderer } from "./GroundRenderer"

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
        // TODO can we just draw to groundrenderer instead of updating every method?
    }

    getRenderMethods(): ImageRender[] {
        return this.schema.render(this.location, this.position)
    }
}
